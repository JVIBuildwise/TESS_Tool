/**
 * app.js
 * -----------------------------------------------------------------------
 * Logique de l'interface de sélection des niveaux de fonctionnalité et
 * de calcul de la norme ISO 52120-1 (classe D/C/B/A), de la méthode BACS
 * (conformité par service à un niveau minimal requis) et du label GRO
 * (niveau Bien / Mieux / Excellent).
 *
 * Navigation principale (3 onglets en haut de l'application) :
 *   1. "home"       -> "Main info & objectives" : définition du bâtiment
 *                      (type résidentiel / non résidentiel + domaines
 *                      techniques présents), choix d'une ou plusieurs
 *                      méthodes (GRO / ISO 52120-1 / SRI / Exigence BACS)
 *                      + classe visée pour la norme + niveau GRO visé
 *   2. "evaluation" -> Écran à deux colonnes : à gauche la liste des
 *                      domaines techniques cochés sur l'accueil, à droite
 *                      les services du domaine sélectionné (sélection des
 *                      niveaux)
 *   3. "results"    -> Page "Résultats" : synthèse des méthodes
 *                      sélectionnées (norme / BACS / GRO / SRI)
 *
 * Les onglets "Évaluation" et "Résultats" ne sont accessibles qu'une fois
 * le type de bâtiment, les domaines techniques et au moins une méthode
 * choisis sur l'onglet "Main info & objectives".
 *
 * Un service peut être marqué "non applicable à ce bâtiment" : dans ce cas
 * aucun niveau ne peut être sélectionné pour lui et il est exclu de tous
 * les calculs (norme, GRO, SRI, BACS).
 * -----------------------------------------------------------------------
 */

import { domains } from "../data/index.js";
import { objectives } from "../data/objectives.js";
import { translations } from "../data/translations.js";
import { SRI_DOMAIN_WEIGHTS, SRI_CRITERIA_WEIGHTS, SRI_KF_GROUPS } from "../data/sriWeights.js";
import { vekaExtraQuestions } from "../data/vekaExtra.js";

const STORAGE_KEY = "iso52120_sri_selections_v1";
const LANG_KEY = "iso52120_sri_lang_v1";
const DOMAIN_KEY = "iso52120_sri_active_domain_v1";
const OBJECTIVES_KEY = "iso52120_sri_objectives_v2";
const NA_KEY = "iso52120_sri_na_v1";
const ISO_TARGET_KEY = "iso52120_sri_target_class_v1";
const GRO_TARGET_KEY = "iso52120_sri_gro_target_v1";
const BUILDING_TYPE_KEY = "iso52120_sri_building_type_v1";
const SELECTED_DOMAINS_KEY = "iso52120_sri_selected_domains_v1";
const VIEW_KEY = "iso52120_sri_view_v1";
const GRO_CRITERIA_KEY = "iso52120_sri_gro_criteria_v1";
// NOUVEAU : réponses à la question "réaction lente ?" pour les services
// concernés (H1 et C1, niveau 3). Clé = service.id, valeur = true/false.
const SLOW_REACTION_KEY = "iso52120_sri_slow_reaction_v1";
// NOUVEAU : réponses aux questions complémentaires BACS "extra vraag"
// VEKA (voir data/vekaExtra.js). Clé = question.id, valeur = true/false.
const VEKA_ANSWERS_KEY = "iso52120_sri_veka_answers_v1";

// Ordre des classes, de la meilleure (A) à la moins bonne (D).
const CLASS_ORDER = ["A", "B", "C", "D"];
function rankOfClass(cls) {
  const idx = CLASS_ORDER.indexOf(cls);
  return idx === -1 ? null : idx;
}

// Ordre des niveaux GRO, du moins bon au meilleur.
const GRO_LEVEL_ORDER = ["GOOD", "BETER", "EXCELLENT"];
const GRO_LEVEL_TRANSLATION_KEYS = {
  GOOD: "GRO-GOOD",
  BETER: "GRO-Beter",
  EXCELLENT: "GRO-Exc"
};
function groRank(level) {
  const idx = GRO_LEVEL_ORDER.indexOf(level);
  return idx === -1 ? -1 : idx;
}

// Les 7 critères SRI, également utilisés par le calcul GRO : l'utilisateur
// doit en choisir au moins 3 sur lesquels il souhaite travailler. Seuls les
// services qui "influencent" au moins un de ces critères choisis sont
// ensuite pris en compte dans le calcul du label GRO (voir
// serviceInfluencesSelectedCriteria).
const GRO_CRITERIA = [
  { key: "energyEfficiency", labelKey: "CR_EE" },
  { key: "flexibility", labelKey: "CR_FL" },
  { key: "comfort", labelKey: "CR_COMF" },
  { key: "convenience", labelKey: "CR_CONV" },
  { key: "health", labelKey: "CR_H" },
  { key: "maintenance", labelKey: "CR_M" },
  { key: "information", labelKey: "CR_INF" }
];
const GRO_CRITERIA_MIN_COUNT = 3;
// Seuil minimal du score (au dernier niveau du service) pour qu'un service
// soit considéré comme influençant un critère donné.
const GRO_CRITERIA_INFLUENCE_THRESHOLD = 2;

// -----------------------------------------------------------------------
// NOUVEAU : classe de norme "effective" d'un niveau, en tenant compte de la
// question "réaction lente ?" (services H1 / C1, niveau 3 uniquement).
// - lvl.slowReactionQuestion === true  -> le niveau dépend de la réponse
// - réponse "oui" (réaction lente)     -> lvl.slowReactionNormClass (= A)
// - réponse "non" ou pas encore répondu -> lvl.normClass (= B, valeur par
//   défaut déjà présente dans les données)
// N'affecte QUE le calcul/affichage de la norme ISO 52120-1 : les scores
// SRI et les seuils GRO du niveau restent inchangés.
// Résidentiel intégré dans résultat norme
// -----------------------------------------------------------------------
function getNormClassByBuildingType(lvl) {
  if (!lvl?.normClass) return null;

  if (typeof lvl.normClass === "string") {
    return lvl.normClass;
  }

  return lvl.normClass[state.buildingType] || null;
}

function getEffectiveNormClass(service, lvl) {
  if (!lvl) return null;

  let normClass = getNormClassByBuildingType(lvl);

  if (lvl.slowReactionQuestion) {
    const answer = state.slowReactionAnswers[service.id];
    if (answer === true) {
      const slowClass = lvl.slowReactionNormClass;
      if (typeof slowClass === "string") {
        return slowClass;
      }
      return slowClass?.[state.buildingType] || normClass;
    }
    return normClass;
  }
  return normClass;
}

// -----------------------------------------------------------------------
// NOUVEAU : questions complémentaires BACS "extra vraag" VEKA
// (voir data/vekaExtra.js pour le détail de chaque question).
// -----------------------------------------------------------------------
/** L'éventuelle entrée `parents` d'une question VEKA qui correspond à ce service. */
function getVekaParentEntry(question, service) {
  if (!question.parents) return null;
  return (
    question.parents.find((p) => p.domain === service.domain && p.serviceId === service.id) || null
  );
}
/** Les sous-questions VEKA rattachées à un service donné (H_11, C_11, V_11, MC2...). */
function getVekaSubquestionsForService(service) {
  return vekaExtraQuestions.filter(
    (q) => q.kind === "subquestion" && getVekaParentEntry(q, service)
  );
}
/**
 * Détermine si une question VEKA doit être affichée / comptée, selon son
 * rattachement (autonome / sous-question). Utilisée à la fois par le rendu
 * et par le calcul des résultats BACS (computeVekaBacsResults), pour
 * garantir la cohérence entre affichage et synthèse.
 * NOTE : il n'y a AUCUNE cascade entre questions VEKA (ex : G2 et G4 sont
 * deux questions totalement indépendantes, posées aux mêmes emplacements
 * mais chacune toujours visible dès que sa condition propre est remplie,
 * quelle que soit la réponse donnée à l'autre).
 */
function isVekaQuestionVisible(question) {
  if (!state.selectedObjectives.includes("BACS")) return false;
  if (question.kind === "standalone") {
    return state.selectedDomains.includes(question.domain);
  }
  if (question.kind === "subquestion") {
    return (question.parents || []).some((p) => {
      if (!state.selectedDomains.includes(p.domain)) return false;
      const domainObj = domains.find((d) => d.key === p.domain);
      const service = domainObj && domainObj.services.find((s) => s.id === p.serviceId);
      if (!service || state.notApplicable[service.id]) return false;
      const lvl = state.selections[service.id];
      if (lvl === undefined || lvl === null) return false;
      return lvl >= (p.fromLevel ?? 0);
    });
  }
  return false;
}

const initialObjectives = loadSelectedObjectives();
const initialBuildingType = loadBuildingType();
const initialSelectedDomains = loadSelectedDomains();
const initialStoredView = loadView();
const initialGroSelectedCriteria = loadGroSelectedCriteria();
const initialSlowReactionAnswers = loadSlowReactionAnswers();
const initialVekaAnswers = loadVekaAnswers();

const state = {
  lang: localStorage.getItem(LANG_KEY) || "fr",
  selections: loadSelections(),
  notApplicable: loadNotApplicable(),
  isoTargetClass: loadIsoTargetClass(),
  groTarget: loadGroTarget(),
  groSelectedCriteria: initialGroSelectedCriteria,
  slowReactionAnswers: initialSlowReactionAnswers,
  vekaAnswers: initialVekaAnswers,
  buildingType: initialBuildingType,
  selectedDomains: initialSelectedDomains,
  activeDomainIndex: initialDomainIndex(),
  selectedObjectives: initialObjectives,
  view: (() => {
    const ready =
      initialObjectives.length > 0 && initialBuildingType && initialSelectedDomains.length > 0;
    if (!ready) return "home";
    return initialStoredView === "results" || initialStoredView === "evaluation"
      ? initialStoredView
      : "evaluation";
  })()
};

// Liste des domaines actuellement retenus (cochés sur l'accueil). Recalculée
// à chaque appel de render() ; toutes les fonctions d'affichage/calcul de
// l'espace de travail s'appuient sur cette liste plutôt que sur `domains`
// (qui reste la liste COMPLÈTE, utilisée uniquement par le sélecteur de
// domaines sur la page d'accueil).
let activeDomains = domains;

// -----------------------------------------------------------------------
// Persistance
// -----------------------------------------------------------------------

function loadSelections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Impossible de charger les sélections sauvegardées :", e);
    return {};
  }
}

function loadNotApplicable() {
  try {
    const raw = localStorage.getItem(NA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Impossible de charger les services non applicables :", e);
    return {};
  }
}

function loadIsoTargetClass() {
  const v = localStorage.getItem(ISO_TARGET_KEY);
  return v === "A" || v === "B" || v === "C" ? v : "B";
}

function loadGroTarget() {
  const v = localStorage.getItem(GRO_TARGET_KEY);
  return GRO_LEVEL_ORDER.includes(v) ? v : "GOOD";
}

/** Critères SRI choisis par l'utilisateur pour le calcul GRO (min. 3 requis). */
function loadGroSelectedCriteria() {
  try {
    const raw = localStorage.getItem(GRO_CRITERIA_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const validKeys = new Set(GRO_CRITERIA.map((c) => c.key));
    return [...new Set(parsed.filter((k) => validKeys.has(k)))];
  } catch (e) {
    console.warn("Impossible de charger les critères GRO sélectionnés :", e);
    return [];
  }
}

function loadBuildingType() {
  const v = localStorage.getItem(BUILDING_TYPE_KEY);
  return v === "RES" || v === "NRES" ? v : null;
}

/**
 * Domaines techniques présents dans le bâtiment. Par défaut (première
 * visite, ou données invalides/corrompues), tous les domaines sont
 * considérés présents ; l'utilisateur peut ensuite décocher ceux qui ne
 * s'appliquent pas à son bâtiment.
 */
function loadSelectedDomains() {
  try {
    const raw = localStorage.getItem(SELECTED_DOMAINS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      const validKeys = new Set(domains.map((d) => d.key));
      const filtered = [...new Set(parsed.filter((k) => validKeys.has(k)))];
      if (filtered.length > 0) return filtered;
    }
  } catch (e) {
    console.warn("Impossible de charger les domaines sélectionnés :", e);
  }
  return domains.map((d) => d.key);
}

function initialDomainIndex() {
  const savedKey = localStorage.getItem(DOMAIN_KEY);
  const idx = domains.findIndex((d) => d.key === savedKey);
  return idx >= 0 ? idx : 0;
}

/** Vue principale sauvegardée ("home" n'est jamais persistée telle quelle). */
function loadView() {
  const v = localStorage.getItem(VIEW_KEY);
  return v === "evaluation" || v === "results" ? v : null;
}

function loadSelectedObjectives() {
  try {
    const raw = localStorage.getItem(OBJECTIVES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(objectives.map((o) => o.id));
    return [...new Set(parsed.filter((id) => validIds.has(id)))];
  } catch (e) {
    console.warn("Impossible de charger les méthodes sélectionnées :", e);
    return [];
  }
}

function saveSelections() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selections));
  updateProgress();
}

function saveNotApplicable() {
  localStorage.setItem(NA_KEY, JSON.stringify(state.notApplicable));
}

function saveIsoTargetClass() {
  localStorage.setItem(ISO_TARGET_KEY, state.isoTargetClass);
}

function saveGroTarget() {
  localStorage.setItem(GRO_TARGET_KEY, state.groTarget);
}

function saveGroSelectedCriteria() {
  localStorage.setItem(GRO_CRITERIA_KEY, JSON.stringify(state.groSelectedCriteria));
}
/** NOUVEAU : réponses "réaction lente ?" (services H1 / C1, niveau 3). */
function loadSlowReactionAnswers() {
  try {
    const raw = localStorage.getItem(SLOW_REACTION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.warn("Impossible de charger les réponses 'réaction lente' :", e);
    return {};
  }
}
function saveSlowReactionAnswers() {
  localStorage.setItem(SLOW_REACTION_KEY, JSON.stringify(state.slowReactionAnswers));
}

/** NOUVEAU : réponses aux questions complémentaires BACS VEKA (Oui/Non). */
function loadVekaAnswers() {
  try {
    const raw = localStorage.getItem(VEKA_ANSWERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.warn("Impossible de charger les réponses VEKA :", e);
    return {};
  }
}
function saveVekaAnswers() {
  localStorage.setItem(VEKA_ANSWERS_KEY, JSON.stringify(state.vekaAnswers));
}

function saveBuildingType() {
  localStorage.setItem(BUILDING_TYPE_KEY, state.buildingType);
}

function saveSelectedDomains() {
  localStorage.setItem(SELECTED_DOMAINS_KEY, JSON.stringify(state.selectedDomains));
}

function saveActiveDomain() {
  const domain = activeDomains[state.activeDomainIndex];
  if (domain) localStorage.setItem(DOMAIN_KEY, domain.key);
}

function saveView() {
  localStorage.setItem(VIEW_KEY, state.view);
}

function saveSelectedObjectives() {
  localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(state.selectedObjectives));
}

// -----------------------------------------------------------------------
// Traduction
// -----------------------------------------------------------------------

function t(key, fallback = key) {
  if (!key) return fallback;
  const entry = translations[key];
  if (!entry) return fallback;
  return entry[state.lang] || entry.fr || entry.en || fallback;
}

function tf(key, vars, fallback) {
  let str = t(key, fallback);
  Object.entries(vars || {}).forEach(([k, v]) => {
    str = str.split(`{${k}}`).join(String(v));
  });
  return str;
}

// -----------------------------------------------------------------------
// Domaines actifs (cochés sur l'accueil)
// -----------------------------------------------------------------------

function getActiveDomains() {
  return domains.filter((d) => state.selectedDomains.includes(d.key));
}

// -----------------------------------------------------------------------
// Filtrage des services par méthode(s) sélectionnée(s) et par "non
// applicable". Un service sans applicableFor (ou vide) est considéré
// comme commun à toutes les méthodes.
// -----------------------------------------------------------------------

function getVisibleServices(domain) {
  if (!domain || !domain.services) return [];
  if (state.selectedObjectives.length === 0) return domain.services;
  return domain.services.filter((service) => {
    if (!service.applicableFor || service.applicableFor.length === 0) return true;
    return service.applicableFor.some((obj) => state.selectedObjectives.includes(obj));
  });
}

/** Services visibles ET considérés dans les calculs (donc hors "non applicable"). */
function getCountableServices(domain) {
  return getVisibleServices(domain).filter((s) => !state.notApplicable[s.id]);
}

function getDomainCompletion(domain) {
  const countable = getCountableServices(domain);
  const total = countable.length;
  const done = countable.filter(
    (s) => state.selections[s.id] !== undefined && state.selections[s.id] !== null
  ).length;
  return { done, total };
}

function getOverallCompletion() {
  const all = activeDomains.flatMap((d) => getCountableServices(d));
  const total = all.length;
  const done = all.filter(
    (s) => state.selections[s.id] !== undefined && state.selections[s.id] !== null
  ).length;
  return { done, total };
}

// -----------------------------------------------------------------------
// Calcul de la norme ISO 52120-1
// -----------------------------------------------------------------------
// Seuls les domaines cochés sur l'accueil (activeDomains) sont pris en
// compte dans le calcul.

// Clé du domaine "Électricité" à exclure entièrement du score (pas de domainClass, pas de contribution au score global)
const ELECTRICITY_DOMAIN_KEY = "electricity";

function computeNormResults() {
  const target = state.isoTargetClass || "B";
  const targetRank = rankOfClass(target);

  const domainResults = [];
  const failingServices = [];

  // ÉTAPE PRÉALABLE : on recense tous les services "délocalisés" via le tag scoreIn.
  // Un service reste physiquement dans son fichier de domaine d'origine (ex: V_11 dans ventilation.js)
  // et l'utilisateur continue à le compléter là où il est habitué, mais si scoreIn est défini
  // et différent de son propre domaine, son score doit être comptabilisé dans le domaine cible ("mc").
  const reassignedServices = [];
  activeDomains.forEach((domain) => {
    domain.services.forEach((s) => {
      if (s.scoreIn && s.scoreIn !== domain.key) {
        reassignedServices.push({ service: s, targetDomainKey: s.scoreIn });
      }
    });
  });

  activeDomains.forEach((domain) => {
    // Le domaine Électricité est exclu du calcul de score dans son intégralité
    if (domain.key === ELECTRICITY_DOMAIN_KEY) {
      domainResults.push({
        domain,
        domainClass: null,
        total: 0,
        answeredCount: 0
      });
      return;
      // Note : les services de ce domaine tagués scoreIn: "mc" (ex: E7, E3, E4, E5) sont quand même
      // récupérés plus haut dans reassignedServices et seront comptés dans MC malgré ce return.
    }

    // Services natifs de ce domaine : on exclut ceux tagués `scoreIn` vers un AUTRE domaine
    const ownRelevant = domain.services.filter((s) => {
      if (!s.applicableFor || !s.applicableFor.includes("ISO52120")) return false;
      if (state.notApplicable[s.id]) return false;
      if (s.scoreIn && s.scoreIn !== domain.key) return false; // délocalisé ailleurs -> pas ici
      return true;
    });

    // Services provenant d'AUTRES domaines mais taggés pour être scorés ICI (ex: V_11 -> "mc")
    const incomingRelevant = reassignedServices
      .filter((r) => r.targetDomainKey === domain.key)
      .map((r) => r.service)
      .filter((s) => s.applicableFor && s.applicableFor.includes("ISO52120") && !state.notApplicable[s.id]);

    // Fusion des services natifs + des services "importés" via le tag
    const relevant = [...ownRelevant, ...incomingRelevant];

    const answered = [];
    const OR_GROUP_IDS = new Set(["E2", "E3", "E4"]);
    const orGroup = [];
    let orGroupPassed = false;

    relevant.forEach((s) => {
      const selectedLevel = state.selections[s.id];
      if (selectedLevel === undefined || selectedLevel === null) return;

      const rawLvl = s.levels.find((l) => l.level === selectedLevel);
      if (!rawLvl) return;
      // NOUVEAU : pour H1/C1 niveau 3, la classe dépend de la réponse à la
      // question "réaction lente ?" (voir getEffectiveNormClass).
      const effectiveNormClass = getEffectiveNormClass(s, rawLvl);
      if (!effectiveNormClass) return;
      const lvl = { ...rawLvl, normClass: effectiveNormClass };

      answered.push({ service: s, level: lvl, domain });

      if (OR_GROUP_IDS.has(s.id)) {
        orGroup.push({ service: s, level: lvl, domain });
        if (rankOfClass(lvl.normClass) <= targetRank) {
          orGroupPassed = true;
        }
        return; // on ne traite pas E2/E3/E4 individuellement
      }

      if (rankOfClass(lvl.normClass) > targetRank) {
        failingServices.push({ service: s, level: lvl, domain });
      }
    });

// Le groupe OR ne compte comme "failing" que si AUCUN des services répondus n'a atteint la classe cible
if (orGroup.length > 0 && !orGroupPassed) {
  failingServices.push({
    service: {
      id: "E2_OR_E3_OR_E4",
      code: "E2 OR E3 OR E4",
      name: "At least one of E2, E3 or E4 must meet the target class",
    },
    level: null,
    domain,
    isOrGroup: true,
  });
}

    let domainClass = null;
    if (answered.length > 0) {
      domainClass = answered.reduce(
        (worst, item) => (rankOfClass(item.level.normClass) > rankOfClass(worst) ? item.level.normClass : worst),
        "A"
      );
    }

    domainResults.push({
      domain,
      domainClass,
      total: relevant.length,
      answeredCount: answered.length
    });
  });

  let globalClass = null;
  domainResults.forEach((dr) => {
    if (dr.domainClass === null) return;
    if (globalClass === null || rankOfClass(dr.domainClass) > rankOfClass(globalClass)) {
      globalClass = dr.domainClass;
    }
  });

  console.log(domainResults);
  return { target, domainResults, globalClass, failingServices };
}

// -----------------------------------------------------------------------
// Calcul de la méthode BACS
// -----------------------------------------------------------------------

function computeBacsResults() {
  const domainResults = [];
  const failingServices = [];

  activeDomains.forEach((domain) => {
    const relevant = domain.services.filter(
      (s) => s.applicableFor && s.applicableFor.includes("BACS") && s.bacs && !state.notApplicable[s.id]
    );

    let consideredCount = 0;
    let achievedCount = 0;

    relevant.forEach((s) => {
      const selectedLevel = state.selections[s.id];
      if (selectedLevel === undefined || selectedLevel === null) return;

      consideredCount++;
      const targetLevel = s.bacs.level;

      if (selectedLevel >= targetLevel) {
        achievedCount++;
      } else {
        failingServices.push({ service: s, domain, achievedLevel: selectedLevel, targetLevel });
      }
    });

    domainResults.push({
      domain,
      total: relevant.length,
      consideredCount,
      achievedCount
    });
  });

  const globalTotal = domainResults.reduce((sum, d) => sum + d.consideredCount, 0);
  const globalAchieved = domainResults.reduce((sum, d) => sum + d.achievedCount, 0);

  return { domainResults, globalAchieved, globalTotal, failingServices };
}

/**
 * NOUVEAU : synthèse des questions complémentaires BACS "extra vraag"
 * VEKA (voir data/vekaExtra.js). Ne modifie pas le compteur global
 * "X/Y services conformes" de computeBacsResults ci-dessus : ces
 * questions sont affichées à part, dans leur propre sous-section des
 * résultats BACS (voir renderBacsResultsSection).
 */
function computeVekaBacsResults() {
  const relevant = vekaExtraQuestions.filter(
    (q) => q.bacsRequired && isVekaQuestionVisible(q)
  );
  const answered = relevant.filter((q) => state.vekaAnswers[q.id] !== undefined);
  const achieved = relevant.filter((q) => state.vekaAnswers[q.id] === true);
  const failing = relevant.filter((q) => state.vekaAnswers[q.id] !== true);
  return {
    total: relevant.length,
    answeredCount: answered.length,
    achievedCount: achieved.length,
    failing
  };
}

// -----------------------------------------------------------------------
// Calcul du label GRO (Bien / Mieux / Excellent)
// -----------------------------------------------------------------------
// Le score GRO ne prend en compte que les services qui "influencent" au
// moins un des critères SRI choisis par l'utilisateur (au moins 3 requis,
// voir state.groSelectedCriteria). Un service influence un critère si son
// score au dernier niveau (le plus élevé) est >= GRO_CRITERIA_INFLUENCE_THRESHOLD
// pour ce critère.

/** Score du dernier niveau (le plus élevé) d'un service pour un critère SRI donné. */
function getServiceMaxScoreForCriterion(service, criterion) {
  if (!service.levels || service.levels.length === 0) return 0;
  const lastLevel = service.levels.reduce(
    (max, lvl) => (max === null || lvl.level > max.level ? lvl : max),
    null
  );
  if (!lastLevel || !lastLevel.sriScores) return 0;
  const val = lastLevel.sriScores[criterion];
  return typeof val === "number" ? val : 0;
}

/** Un service est pertinent pour le calcul GRO s'il influence au moins un
 * des critères sélectionnés par l'utilisateur. */
function serviceInfluencesSelectedCriteria(service) {
  if (!state.groSelectedCriteria || state.groSelectedCriteria.length === 0) return false;
  return state.groSelectedCriteria.some(
    (criterion) => getServiceMaxScoreForCriterion(service, criterion) >= GRO_CRITERIA_INFLUENCE_THRESHOLD
  );
}

function computeGroResults() {
  const countable = activeDomains.flatMap((d) =>
    getCountableServices(d).filter(
      (s) => s.applicableFor && s.applicableFor.includes("GRO") && serviceInfluencesSelectedCriteria(s)
    )
  );

  const total = countable.length;
  const answered = countable.filter(
    (s) => state.selections[s.id] !== undefined && state.selections[s.id] !== null
  );
  const answeredCount = answered.length;
  const allAnswered = total > 0 && answeredCount === total;

  const basicEntries = countable
    .filter((s) => s.gro && Array.isArray(s.gro.basic) && s.gro.basic.length > 0)
    .map((s) => ({ service: s, threshold: Math.min(...s.gro.basic.map((b) => b.level)) }));

  const basicTotal = basicEntries.length;
  const basicReached = basicEntries.filter(({ service, threshold }) => {
    const lvl = state.selections[service.id];
    return lvl !== undefined && lvl !== null && lvl >= threshold;
  });
  const basicReachedCount = basicReached.length;
  const basicFailing = basicEntries.filter(({ service, threshold }) => {
    const lvl = state.selections[service.id];
    return lvl === undefined || lvl === null || lvl < threshold;
  });
  const basicPercentage = basicTotal > 0 ? basicReachedCount / basicTotal : 0;

  const optionalEntries = countable
    .filter((s) => s.gro && Array.isArray(s.gro.optional) && s.gro.optional.length > 0)
    .map((s) => ({ service: s, threshold: Math.min(...s.gro.optional.map((o) => o.level)) }));

  const optionalTotal = optionalEntries.length;
  const optionalReached = optionalEntries.filter(({ service, threshold }) => {
    const lvl = state.selections[service.id];
    return lvl !== undefined && lvl !== null && lvl >= threshold;
  });
  const optionalReachedCount = optionalReached.length;

  const meetsGood = allAnswered;
  const meetsBeter = meetsGood && basicPercentage >= 0.5;
  const meetsExcellent = meetsBeter && basicPercentage >= 0.7 && optionalReachedCount >= 5;

  let achievedLevel = null;
  if (meetsExcellent) achievedLevel = "EXCELLENT";
  else if (meetsBeter) achievedLevel = "BETER";
  else if (meetsGood) achievedLevel = "GOOD";

  const target = state.groTarget || "GOOD";
  const targetAchieved = achievedLevel !== null && groRank(achievedLevel) >= groRank(target);

  return {
    total,
    answeredCount,
    allAnswered,
    basicTotal,
    basicReachedCount,
    basicPercentage,
    basicFailing,
    optionalTotal,
    optionalReachedCount,
    achievedLevel,
    target,
    targetAchieved
  };
}

// -----------------------------------------------------------------------
// Calcul du score SRI (Smart Readiness Indicator)
// -----------------------------------------------------------------------
// Le calcul se fait en 4 étapes, sur les domaines actifs (activeDomains) :
//
//   1. Matrice domaine x critère : pour chaque domaine et chacun des 7
//      critères SRI, on calcule
//         score = (somme des scores obtenus) / (somme des scores maximum)
//      pour l'ensemble des services SRI du domaine. Le score maximum d'un
//      service est le score de son DERNIER niveau (le plus élevé), voir
//      getServiceMaxScoreForCriterion (déjà utilisé pour le GRO). Un
//      service marqué "non applicable" est exclu du numérateur ET du
//      dénominateur, SAUF s'il est marqué TRIAGE : dans ce cas son score
//      maximum reste compté au dénominateur (score obtenu = 0). Un
//      service pas encore répondu (aucun niveau sélectionné) compte pour
//      0 au numérateur, mais son maximum reste compté.
//
//   2. Score global par critère (agrégation en COLONNE, sur tous les
//      domaines) : moyenne pondérée des scores domaine x critère de
//      l'étape 1, pondérée par SRI_DOMAIN_WEIGHTS[buildingType][domaine]
//      [critère]. Les poids sont renormalisés parmi les domaines actifs
//      et pertinents (score non nul) pour ce critère.
//
//   3. Score par domaine (agrégation en LIGNE, sur tous les critères) :
//      moyenne pondérée des scores domaine x critère de l'étape 1,
//      pondérée par SRI_CRITERIA_WEIGHTS. Les poids sont renormalisés
//      parmi les critères pertinents (score non nul) pour ce domaine
//      (ex : "flexibility"/"maintenance"/"information" ne sont pas
//      influencés par le domaine "lighting").
//
//   4. Key Functionalities + score global : les 7 scores par critère
//      (étape 2) sont regroupés en 3 Key Functionalities (KF1/KF2/KF3,
//      voir SRI_KF_GROUPS), chaque KF étant une moyenne pondérée par
//      SRI_CRITERIA_WEIGHTS (renormalisés au sein du groupe). Le score
//      global du bâtiment est la moyenne simple des 3 KF.

/** Score obtenu et score maximum d'un domaine, pour un critère SRI donné. */
function computeDomainCriterionRaw(domain, criterion) {
  let obtained = 0;
  let max = 0;

  domain.services.forEach((s) => {
    if (!s.applicableFor || !s.applicableFor.includes("SRI")) return;

    const isNA = !!state.notApplicable[s.id];
    const serviceMax = getServiceMaxScoreForCriterion(s, criterion);

    if (isNA) {
      // TRIAGE : le maximum reste compté au dénominateur, le score
      // obtenu vaut 0. Les autres services N/A sont exclus des deux.
      if (s.triage) max += serviceMax;
      return;
    }

    max += serviceMax;

    const selectedLevel = state.selections[s.id];
    if (selectedLevel === undefined || selectedLevel === null) return;
    const lvl = s.levels.find((l) => l.level === selectedLevel);
    if (!lvl || !lvl.sriScores) return;
    const val = lvl.sriScores[criterion];
    obtained += typeof val === "number" ? val : 0;
  });

  return { obtained, max };
}

function computeSriResults() {
  const buildingType = state.buildingType === "RES" ? "RES" : "NRES";
  const domainWeights = SRI_DOMAIN_WEIGHTS[buildingType] || {};
  const criteriaKeys = GRO_CRITERIA.map((c) => c.key);

  // ---- Étape 1 : matrice domaine x critère -------------------------------
  const matrix = {};
  activeDomains.forEach((domain) => {
    matrix[domain.key] = {};
    criteriaKeys.forEach((criterion) => {
      const { obtained, max } = computeDomainCriterionRaw(domain, criterion);
      matrix[domain.key][criterion] = {
        obtained,
        max,
        score: max > 0 ? obtained / max : null
      };
    });
  });

  // ---- Étape 2 : score global par critère (colonnes) ---------------------
  const criterionScores = {};
  criteriaKeys.forEach((criterion) => {
    let weightedObtained = 0;
    let weightedMax = 0;
    activeDomains.forEach((domain) => {
      const cell = matrix[domain.key][criterion];
      if (!cell || cell.score === null) return;
      const w = (domainWeights[domain.key] && domainWeights[domain.key][criterion]) || 0;
      if (w <= 0) return;
      weightedObtained += cell.obtained * w; // pondération sur le brut
      weightedMax += cell.max * w;

    });
    criterionScores[criterion] = weightedObtained / weightedMax;
  });

  // ---- Étape 3 : score par domaine (lignes) ------------------------------
  const domainScores = {};
  activeDomains.forEach((domain) => {
    let weightedSum = 0;
    let weightTotal = 0;
    criteriaKeys.forEach((criterion) => {
      const cell = matrix[domain.key][criterion];
      if (!cell || cell.score === null) return;
      const w = SRI_CRITERIA_WEIGHTS[criterion] || 0;
      weightedSum += cell.score * w;
      weightTotal += w;
    });
    domainScores[domain.key] = weightTotal > 0 ? weightedSum / weightTotal : null;
  });

  // ---- Étape 4 : Key Functionalities + score global ----------------------
  const kfScores = {};
  Object.entries(SRI_KF_GROUPS).forEach(([kfKey, criteriaList]) => {
    let weightedSum = 0;
    let weightTotal = 0;
    criteriaList.forEach((criterion) => {
      const score = criterionScores[criterion];
      if (score === null || score === undefined) return;
      const w = SRI_CRITERIA_WEIGHTS[criterion] || 0;
      weightedSum += score * w;
      weightTotal += w;
    });
    kfScores[kfKey] = weightTotal > 0 ? weightedSum / weightTotal : null;
  });

  const validKf = Object.values(kfScores).filter((v) => v !== null && v !== undefined);
  const globalScore = validKf.length > 0 ? validKf.reduce((sum, v) => sum + v, 0) / validKf.length : null;

  return { buildingType, matrix, criterionScores, domainScores, kfScores, globalScore };
}

// -----------------------------------------------------------------------
// Routage principal : 3 onglets -> home / evaluation / results
// -----------------------------------------------------------------------

function render() {
  activeDomains = getActiveDomains();

  // Garde-fou : si l'on se retrouve sur "evaluation" ou "results" sans
  // aucun domaine actif, ou si les pré-requis de l'accueil ne sont plus
  // remplis (ex. après une modification externe du localStorage), on
  // revient automatiquement à l'accueil plutôt que d'afficher un espace
  // invalide.
  if ((state.view === "evaluation" || state.view === "results") && (activeDomains.length === 0 || !canProceedFromHome())) {
    state.view = "home";
  }

  // Recale le domaine actif s'il ne correspond plus à un domaine valide
  // (ex. après avoir décoché un domaine).
  if (state.activeDomainIndex < 0 || state.activeDomainIndex >= activeDomains.length) {
    state.activeDomainIndex = 0;
  }

  applyStaticTranslations();
  updateTopbar();
  const root = document.getElementById("app-root");
  root.innerHTML = "";

  root.appendChild(renderTopNav());

  if (state.view === "home") {
    root.appendChild(renderHomeScreen());
  } else if (state.view === "results") {
    root.appendChild(renderResultsScreen());
  } else {
    root.appendChild(renderEvaluationScreen());
  }

  updateProgress();
}

/** Les 3 onglets de navigation principale : Main info & objectives / Évaluation / Résultats. */
function renderTopNav() {
  const nav = document.createElement("nav");
  nav.className = "main-nav";
  nav.id = "main-nav";

  const ready = canProceedFromHome();

  [
    { id: "home", icon: "🏠", key: "NAV_HOME", fallback: "Main info & objectives" },
    { id: "evaluation", icon: "🧭", key: "NAV_EVALUATION", fallback: "Évaluation" },
    { id: "results", icon: "📊", key: "NAV_RESULTS", fallback: "Résultats" }
  ].forEach(({ id, icon, key, fallback }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "main-nav-tab" + (state.view === id ? " active" : "");
    btn.disabled = id !== "home" && !ready;

    const iconSpan = document.createElement("span");
    iconSpan.className = "main-nav-tab-icon";
    iconSpan.textContent = icon;
    btn.appendChild(iconSpan);

    const labelSpan = document.createElement("span");
    labelSpan.className = "main-nav-tab-label";
    labelSpan.textContent = t(key, fallback);
    btn.appendChild(labelSpan);

    btn.addEventListener("click", () => goToView(id));
    nav.appendChild(btn);
  });

  return nav;
}

function toggleObjective(id) {
  const idx = state.selectedObjectives.indexOf(id);
  if (idx >= 0) {
    state.selectedObjectives.splice(idx, 1);
  } else {
    state.selectedObjectives.push(id);
  }
  saveSelectedObjectives();
  render();
}

function toggleDomain(key) {
  const idx = state.selectedDomains.indexOf(key);
  if (idx >= 0) {
    state.selectedDomains.splice(idx, 1);
  } else {
    state.selectedDomains.push(key);
  }
  state.activeDomainIndex = 0;
  saveSelectedDomains();
  render();
}

function toggleGroCriterion(key) {
  const idx = state.groSelectedCriteria.indexOf(key);
  if (idx >= 0) {
    state.groSelectedCriteria.splice(idx, 1);
  } else {
    state.groSelectedCriteria.push(key);
  }
  saveGroSelectedCriteria();
  render();
}

function setAllDomainsSelected(selected) {
  state.selectedDomains = selected ? domains.map((d) => d.key) : [];
  state.activeDomainIndex = 0;
  saveSelectedDomains();
  render();
}

function canProceedFromHome() {
  const groCriteriaOk =
    !state.selectedObjectives.includes("GRO") ||
    state.groSelectedCriteria.length >= GRO_CRITERIA_MIN_COUNT;
  return (
    !!state.buildingType &&
    state.selectedDomains.length > 0 &&
    state.selectedObjectives.length > 0 &&
    groCriteriaOk
  );
}

/** Change l'onglet principal actif ("home" / "evaluation" / "results"). */
function goToView(view) {
  if (view !== "home" && !canProceedFromHome()) return;
  state.view = view;
  saveView();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  goToView("home");
}

// -----------------------------------------------------------------------
// Textes statiques (HTML) traduits dynamiquement
// -----------------------------------------------------------------------

function applyStaticTranslations() {
  document.title = t("APP_BRAND", "ISO 52120 / SRI");

  const brandText = document.getElementById("brand-text");
  if (brandText) brandText.textContent = t("APP_BRAND", "ISO 52120 / SRI");

  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) homeBtn.title = t("HOME_BTN_TITLE", "Retour à l'accueil");

  const langSelect = document.getElementById("lang-select");
  if (langSelect) langSelect.title = t("LANG", "Langue");

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.textContent = t("EXPORT_BTN", "Exporter");
    exportBtn.title = t("EXPORT_BTN_TITLE", "Exporter les sélections en JSON");
  }

  const importLabel = document.getElementById("import-label-text");
  if (importLabel) importLabel.textContent = t("IMPORT_BTN", "Importer");
  const importFileBtn = document.getElementById("import-btn");
  if (importFileBtn) importFileBtn.title = t("IMPORT_BTN_TITLE", "Importer un fichier de sélections JSON");

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.textContent = t("RESET_BTN", "Réinitialiser");
    resetBtn.title = t("RESET_BTN_TITLE", "Réinitialiser toutes les sélections");
  }

  const footer = document.getElementById("app-footer-text");
  if (footer) {
    footer.textContent = t(
      "FOOTER_TEXT",
      "Les sélections sont sauvegardées automatiquement dans votre navigateur (localStorage)."
    );
  }
}

function updateTopbar() {
  const chip = document.getElementById("objective-chip");
  if (!chip) return;

  if (state.view !== "home" && state.selectedObjectives.length > 0) {
    chip.hidden = false;
    chip.innerHTML = "";
    state.selectedObjectives.forEach((id) => {
      const obj = objectives.find((o) => o.id === id);
      const pill = document.createElement("span");
      pill.className = "objective-chip-pill";

      const icon = document.createElement("span");
      icon.textContent = obj ? obj.icon : "";
      pill.appendChild(icon);

      const label = document.createElement("span");
      label.textContent = obj ? t(obj.titleKey, obj.id) : id;
      pill.appendChild(label);

      chip.appendChild(pill);
    });
  } else {
    chip.hidden = true;
    chip.innerHTML = "";
  }
}

// -----------------------------------------------------------------------
// Écran d'accueil
// -----------------------------------------------------------------------

function renderHomeScreen() {
  const wrap = document.createElement("div");
  wrap.className = "home-screen";

  const title = document.createElement("h1");
  title.className = "home-title";
  title.textContent = t("HOME_TITLE", "Que souhaitez-vous évaluer ?");
  wrap.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "home-subtitle";
  subtitle.textContent = t(
    "HOME_SUBTITLE",
    "Sélectionnez une ou plusieurs méthodes à calculer, puis cliquez sur Suivant."
  );
  wrap.appendChild(subtitle);

  // --- NOUVEAU : type de bâtiment + domaines techniques présents ---
  wrap.appendChild(renderBuildingTypePicker());
  wrap.appendChild(renderDomainsPicker());

  const grid = document.createElement("div");
  grid.className = "objective-grid";
  objectives.forEach((obj) => {
    grid.appendChild(renderObjectiveCard(obj));
  });
  wrap.appendChild(grid);

  if (state.selectedObjectives.includes("GRO")) {
    wrap.appendChild(renderGroTargetPicker());
    wrap.appendChild(renderGroCriteriaPicker());
  }

  if (state.selectedObjectives.includes("ISO52120")) {
    wrap.appendChild(renderTargetClassPicker());
  }

  const actions = document.createElement("div");
  actions.className = "home-actions";

  const count = state.selectedObjectives.length;
  const hint = document.createElement("p");
  hint.className = "home-selection-hint";
  hint.textContent = homeHintText(count);
  actions.appendChild(hint);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "next-btn";
  nextBtn.textContent = t("NEXT_BTN", "Suivant →");
  nextBtn.disabled = !canProceedFromHome();
  nextBtn.addEventListener("click", () => goToView("evaluation"));
  actions.appendChild(nextBtn);

  wrap.appendChild(actions);
  return wrap;
}

function homeHintText(count) {
  if (!state.buildingType) {
    return t("HOME_HINT_MISSING_BUILDING_TYPE", "Sélectionnez le type de bâtiment pour continuer.");
  }
  if (state.selectedDomains.length === 0) {
    return t("HOME_HINT_MISSING_DOMAINS", "Sélectionnez au moins un domaine technique pour continuer.");
  }
  if (count === 0) return t("HOME_HINT_NONE", "Aucune méthode sélectionnée pour l'instant.");
  if (
    state.selectedObjectives.includes("GRO") &&
    state.groSelectedCriteria.length < GRO_CRITERIA_MIN_COUNT
  ) {
    return t(
      "HOME_HINT_MISSING_GRO_CRITERIA",
      `Sélectionnez au moins ${GRO_CRITERIA_MIN_COUNT} critères GRO pour continuer.`
    );
  }
  const word =
    count === 1
      ? t("HOME_HINT_SINGULAR", "méthode sélectionnée")
      : t("HOME_HINT_PLURAL", "méthodes sélectionnées");
  return `${count} ${word}.`;
}

/** NOUVEAU : sélecteur du type de bâtiment (Résidentiel / Non résidentiel). */
function renderBuildingTypePicker() {
  const box = document.createElement("div");
  box.className = "target-class-picker building-type-picker";

  const label = document.createElement("p");
  label.className = "target-class-picker-label";
  label.textContent = t("BUILD_TYPE", "Type de bâtiment");
  box.appendChild(label);

  const options = document.createElement("div");
  options.className = "target-class-options building-type-options";

  [
    { value: "RES", key: "RES_BUILD", fallback: "Résidentiel" },
    { value: "NRES", key: "NRES", fallback: "Non résidentiel" }
  ].forEach(({ value, key, fallback }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "target-class-option building-type-option" + (state.buildingType === value ? " active" : "");
    btn.textContent = t(key, fallback);
    btn.addEventListener("click", () => {
      state.buildingType = value;
      saveBuildingType();
      render();
    });
    options.appendChild(btn);
  });

  box.appendChild(options);
  return box;
}

/** NOUVEAU : sélecteur des domaines techniques présents dans le bâtiment. */
function renderDomainsPicker() {
  const box = document.createElement("div");
  box.className = "target-class-picker domains-picker";

  const label = document.createElement("p");
  label.className = "target-class-picker-label";
  label.textContent = t("DOMAINS_PICKER_LABEL", "Domaines techniques présents dans le bâtiment");
  box.appendChild(label);

  const quickActions = document.createElement("div");
  quickActions.className = "domains-quick-actions";

  const selectAllBtn = document.createElement("button");
  selectAllBtn.type = "button";
  selectAllBtn.className = "domains-quick-btn";
  selectAllBtn.textContent = t("DOMAINS_SELECT_ALL", "Tout sélectionner");
  selectAllBtn.addEventListener("click", () => setAllDomainsSelected(true));
  quickActions.appendChild(selectAllBtn);

  const selectNoneBtn = document.createElement("button");
  selectNoneBtn.type = "button";
  selectNoneBtn.className = "domains-quick-btn";
  selectNoneBtn.textContent = t("DOMAINS_SELECT_NONE", "Tout désélectionner");
  selectNoneBtn.addEventListener("click", () => setAllDomainsSelected(false));
  quickActions.appendChild(selectNoneBtn);

  box.appendChild(quickActions);

  const list = document.createElement("div");
  list.className = "domains-checklist";

  domains.forEach((domain) => {
    const row = document.createElement("label");
    row.className = "domain-check-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedDomains.includes(domain.key);
    checkbox.addEventListener("change", () => toggleDomain(domain.key));
    row.appendChild(checkbox);

    const icon = document.createElement("span");
    icon.className = "domain-check-icon";
    icon.textContent = domain.icon || "▪";
    row.appendChild(icon);

    const name = document.createElement("span");
    name.className = "domain-check-label";
    name.textContent = t(domain.titleKey, domain.key);
    row.appendChild(name);

    list.appendChild(row);
  });

  box.appendChild(list);

  const hint = document.createElement("p");
  hint.className = "target-class-picker-hint";
  hint.textContent = t(
    "DOMAINS_PICKER_HINT",
    "Seuls les domaines cochés seront proposés dans le parcours et les résultats."
  );
  box.appendChild(hint);

  return box;
}

function renderObjectiveCard(obj) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "objective-card";
  card.style.setProperty("--accent", obj.accent || "#0087b7");

  const isSelected = state.selectedObjectives.includes(obj.id);
  if (isSelected) card.classList.add("objective-card-active");
  card.setAttribute("aria-pressed", String(isSelected));

  const checkbox = document.createElement("span");
  checkbox.className = "objective-checkbox";
  checkbox.textContent = isSelected ? "✓" : "";
  card.appendChild(checkbox);

  const icon = document.createElement("div");
  icon.className = "objective-icon";
  icon.textContent = obj.icon;
  card.appendChild(icon);

  const title = document.createElement("h3");
  title.className = "objective-card-title";
  title.textContent = t(obj.titleKey, obj.id);
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "objective-card-desc";
  desc.textContent = t(obj.descKey, "");
  card.appendChild(desc);

  card.addEventListener("click", () => toggleObjective(obj.id));

  return card;
}

function renderTargetClassPicker() {
  const box = document.createElement("div");
  box.className = "target-class-picker";

  const label = document.createElement("p");
  label.className = "target-class-picker-label";
  label.textContent = t("TARGET_CLASS_PICKER_LABEL", "Classe visée pour la norme");
  box.appendChild(label);

  const options = document.createElement("div");
  options.className = "target-class-options";

  ["A", "B", "C"].forEach((cls) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "target-class-option" + (state.isoTargetClass === cls ? " active" : "");
    btn.textContent = cls;
    btn.addEventListener("click", () => {
      state.isoTargetClass = cls;
      saveIsoTargetClass();
      render();
    });
    options.appendChild(btn);
  });

  box.appendChild(options);

  const hint = document.createElement("p");
  hint.className = "target-class-picker-hint";
  hint.textContent = t(
    "TARGET_CLASS_PICKER_HINT",
    "Les services n'atteignant pas cette classe seront listés dans les résultats."
  );
  box.appendChild(hint);

  return box;
}

function renderGroTargetPicker() {
  const box = document.createElement("div");
  box.className = "target-class-picker gro-target-picker";

  const label = document.createElement("p");
  label.className = "target-class-picker-label";
  label.textContent = t("GRO_TARGET_PICKER_LABEL", "Niveau GRO visé");
  box.appendChild(label);

  const options = document.createElement("div");
  options.className = "target-class-options gro-target-options";

  GRO_LEVEL_ORDER.forEach((level) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "target-class-option gro-target-option" + (state.groTarget === level ? " active" : "");
    btn.textContent = t(GRO_LEVEL_TRANSLATION_KEYS[level], level);
    btn.addEventListener("click", () => {
      state.groTarget = level;
      saveGroTarget();
      render();
    });
    options.appendChild(btn);
  });

  box.appendChild(options);

  const hint = document.createElement("p");
  hint.className = "target-class-picker-hint";
  hint.textContent = t(
    "GRO_TARGET_PICKER_HINT",
    "Bien : tous les services répondus. Mieux : ≥ 50% des services de base atteints. Excellent : ≥ 70% des services de base et ≥ 5 services optionnels atteints."
  );
  box.appendChild(hint);

  return box;
}

/**
 * NOUVEAU : sélecteur des critères SRI sur lesquels l'utilisateur souhaite
 * travailler pour le calcul GRO (au moins 3 requis). Seuls les services qui
 * influencent au moins un des critères choisis sont ensuite repris dans le
 * calcul (voir serviceInfluencesSelectedCriteria).
 */
function renderGroCriteriaPicker() {
  const box = document.createElement("div");
  box.className = "target-class-picker gro-criteria-picker";

  const label = document.createElement("p");
  label.className = "target-class-picker-label";
  label.textContent = t(
    "GRO_CR",
    "GRO : Sélectionnez au moins 3 critères sur lesquels vous voulez travailler"
  );
  box.appendChild(label);

  const options = document.createElement("div");
  options.className = "target-class-options gro-criteria-options";

  GRO_CRITERIA.forEach(({ key, labelKey }) => {
    const isSelected = state.groSelectedCriteria.includes(key);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "target-class-option gro-criteria-option" + (isSelected ? " active" : "");
    btn.textContent = t(labelKey, key);
    btn.setAttribute("aria-pressed", String(isSelected));
    btn.addEventListener("click", () => toggleGroCriterion(key));
    options.appendChild(btn);
  });

  box.appendChild(options);

  const count = state.groSelectedCriteria.length;
  const hint = document.createElement("p");
  hint.className =
    "target-class-picker-hint" + (count < GRO_CRITERIA_MIN_COUNT ? " gro-criteria-hint-warning" : "");
  hint.textContent =
    count >= GRO_CRITERIA_MIN_COUNT
      ? tf("GRO_CRITERIA_COUNT_OK", { count }, `${count} critères sélectionnés.`)
      : tf(
          "GRO_CRITERIA_COUNT_MISSING",
          { count, min: GRO_CRITERIA_MIN_COUNT },
          `${count}/${GRO_CRITERIA_MIN_COUNT} critères minimum sélectionnés.`
        );
  box.appendChild(hint);

  return box;
}

// -----------------------------------------------------------------------
// Écran "Évaluation" : colonne de gauche = domaines techniques,
// colonne de droite = services du domaine sélectionné.
// -----------------------------------------------------------------------

function renderEvaluationScreen() {
  const wrap = document.createElement("div");
  wrap.className = "evaluation-screen";

  wrap.appendChild(renderProgressBar());

  const layout = document.createElement("div");
  layout.className = "evaluation-layout";
  layout.appendChild(renderDomainSidebar());
  layout.appendChild(renderEvaluationContent());
  wrap.appendChild(layout);

  wrap.appendChild(renderPager());

  return wrap;
}

function totalSteps() {
  return activeDomains.length;
}

/** Colonne de gauche : liste des domaines techniques cochés sur l'accueil. */
function renderDomainSidebar() {
  const sidebar = document.createElement("nav");
  sidebar.className = "domain-sidebar";
  sidebar.id = "domain-sidebar";

  activeDomains.forEach((domain, index) => {
    const isActive = index === state.activeDomainIndex;
    const completion = getDomainCompletion(domain);

    const item = document.createElement("button");
    item.type = "button";
    item.className = "domain-sidebar-item" + (isActive ? " active" : "");

    const iconSpan = document.createElement("span");
    iconSpan.className = "domain-sidebar-icon";
    iconSpan.textContent = domain.icon || "▪";
    item.appendChild(iconSpan);

    const textWrap = document.createElement("span");
    textWrap.className = "domain-sidebar-text";

    const labelSpan = document.createElement("span");
    labelSpan.className = "domain-sidebar-label";
    labelSpan.textContent = t(domain.titleKey, domain.key);
    textWrap.appendChild(labelSpan);

    const miniTrack = document.createElement("span");
    miniTrack.className = "domain-sidebar-progress-track";
    const miniFill = document.createElement("span");
    miniFill.className = "domain-sidebar-progress-fill";
    const pct = completion.total ? (completion.done / completion.total) * 100 : 0;
    miniFill.style.width = `${pct}%`;
    if (completion.done === completion.total && completion.total > 0) {
      miniFill.classList.add("complete");
    }
    miniTrack.appendChild(miniFill);
    textWrap.appendChild(miniTrack);

    item.appendChild(textWrap);

    const countBadge = document.createElement("span");
    countBadge.className = "domain-sidebar-count";
    countBadge.textContent = `${completion.done}/${completion.total}`;
    item.appendChild(countBadge);

    item.addEventListener("click", () => goToDomain(index));
    sidebar.appendChild(item);
  });

  return sidebar;
}

function renderProgressBar() {
  const wrap = document.createElement("div");
  wrap.className = "progress-wrap";

  const label = document.createElement("span");
  label.id = "progress-label";
  wrap.appendChild(label);

  const track = document.createElement("div");
  track.className = "progress-track";
  const bar = document.createElement("div");
  bar.id = "progress-bar";
  track.appendChild(bar);
  wrap.appendChild(track);

  return wrap;
}

function renderEvaluationContent() {
  const main = document.createElement("main");
  main.id = "app";
  main.className = "domain-content";

  const domain = activeDomains[state.activeDomainIndex];
  if (!domain) return main;

  main.appendChild(renderDomainSection(domain));

  const gotoResultsBtn = document.createElement("button");
  gotoResultsBtn.type = "button";
  gotoResultsBtn.className = "goto-results-btn";
  gotoResultsBtn.textContent = t("GOTO_RESULTS_BTN", "Voir les résultats →");
  gotoResultsBtn.addEventListener("click", () => goToView("results"));
  main.appendChild(gotoResultsBtn);

  return main;
}

function renderDomainSection(domain) {
  const section = document.createElement("section");
  section.className = "domain-section";
  section.dataset.domain = domain.key;

  const header = document.createElement("h2");
  header.className = "domain-title";
  header.textContent = `${domain.icon || ""} ${t(domain.titleKey, domain.key)}`.trim();
  section.appendChild(header);

  const list = document.createElement("div");
  list.className = "service-list";

  const visibleServices = getVisibleServices(domain);

  if (visibleServices.length === 0) {
    const empty = document.createElement("p");
    empty.className = "domain-empty";
    empty.textContent = t(
      "DOMAIN_EMPTY_MSG",
      "Aucun service applicable pour ce domaine avec les méthodes sélectionnées."
    );
    list.appendChild(empty);
  } else {
    visibleServices.forEach((service) => {
      list.appendChild(renderServiceCard(service));
    });
  }

  // NOUVEAU : questions complémentaires BACS "extra vraag" VEKA autonomes
  // (pas rattachées à un service existant), affichées en fin de liste pour
  // ce domaine, uniquement quand la méthode BACS est sélectionnée. Chaque
  // question (ex : G2 et G4) est indépendante, sans cascade entre elles.
  vekaExtraQuestions
    .filter((q) => q.kind === "standalone" && q.domain === domain.key)
    .forEach((question) => {
      if (!isVekaQuestionVisible(question)) return;
      list.appendChild(renderVekaStandaloneCard(question));
    });

  section.appendChild(list);
  return section;
}

function renderServiceCard(service) {
  const card = document.createElement("article");
  card.className = "service-card";
  card.dataset.serviceId = service.id;

  const isNA = !!state.notApplicable[service.id];
  if (isNA) card.classList.add("is-na");

  const header = document.createElement("div");
  header.className = "service-header";

  const idBadge = document.createElement("span");
  idBadge.className = "service-id";
  idBadge.textContent = service.id;
  header.appendChild(idBadge);

  const title = document.createElement("h3");
  title.className = "service-title";
  title.textContent = t(service.titleKey, service.id);
  header.appendChild(title);

  if (service.triage) {
    const triageBadge = document.createElement("span");
    triageBadge.className = "badge badge-triage";
    triageBadge.textContent = t("TRIAGE_LABEL", "Triage");
    header.appendChild(triageBadge);
  }

  if (isNA) {
    const naBadge = document.createElement("span");
    naBadge.className = "badge badge-na";
    naBadge.textContent = t("NON_APP", "Non applicable");
    header.appendChild(naBadge);
  }

  card.appendChild(header);

  if (service.exprKey) {
    const desc = document.createElement("p");
    desc.className = "service-desc";
    desc.textContent = t(service.exprKey, "");
    if (desc.textContent) card.appendChild(desc);
  }

  const naRow = document.createElement("label");
  naRow.className = "na-toggle";
  const naInput = document.createElement("input");
  naInput.type = "checkbox";
  naInput.checked = isNA;
  naInput.addEventListener("change", () => {
    if (naInput.checked) {
      state.notApplicable[service.id] = true;
      delete state.selections[service.id];
    } else {
      delete state.notApplicable[service.id];
    }
    saveNotApplicable();
    saveSelections();
    render();
  });
  naRow.appendChild(naInput);
  const naLabelText = document.createElement("span");
  naLabelText.textContent = t(
    "NA_CHECKBOX_LABEL",
    "Ce service n'est pas applicable à ce bâtiment"
  );
  naRow.appendChild(naLabelText);
  card.appendChild(naRow);

  const levelsWrap = document.createElement("div");
  levelsWrap.className = "levels";
  if (isNA) levelsWrap.classList.add("levels-disabled");

  service.levels.forEach((lvl) => {
    levelsWrap.appendChild(renderLevelOption(service, lvl, isNA));
  });

  card.appendChild(levelsWrap);

  // NOUVEAU : question "réaction lente ?" affichée uniquement quand le
  // niveau sélectionné est celui qui la requiert (H1/C1, niveau 3) et que
  // le service n'est pas marqué "non applicable".
  if (!isNA) {
    const selectedLevelObj = service.levels.find(
      (l) => l.level === state.selections[service.id]
    );
    if (selectedLevelObj && selectedLevelObj.slowReactionQuestion) {
      card.appendChild(renderSlowReactionQuestion(service));
    }

    // NOUVEAU : questions complémentaires BACS "extra vraag" VEKA
    // rattachées à ce service (H_11, C_11, V_11, MC2...), visibles à
    // partir du niveau minimal défini dans data/vekaExtra.js. Chaque
    // question (ex : G2 et G4) est indépendante, sans cascade entre elles.
    getVekaSubquestionsForService(service).forEach((question) => {
      renderVekaQuestionIfVisible(question, card);
    });
  }

  const status = document.createElement("div");
  status.className = "service-status";
  status.dataset.role = "status";
  card.appendChild(status);
  updateServiceStatus(service, status);

  return card;
}

/**
 * NOUVEAU : question complémentaire affichée lorsqu'un service (H1/C1) a
 * un niveau sélectionné dont le score de la norme dépend du type de
 * système d'émission (réaction lente ou non).
 */
function renderSlowReactionQuestion(service) {
  const wrap = document.createElement("div");
  wrap.className = "slow-reaction-question";

  const label = document.createElement("p");
  label.className = "slow-reaction-question-label";
  label.textContent = t("H132");
  wrap.appendChild(label);

  const options = document.createElement("div");
  options.className = "slow-reaction-question-options";

  [
    { value: true, key: "YES" },
    { value: false, key: "NO" }
  ].forEach(({ value, key }) => {
    const optId = `${service.id}__slowReaction__${value}`;
    const optWrap = document.createElement("label");
    optWrap.className = "slow-reaction-option";
    optWrap.setAttribute("for", optId);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `${service.id}__slowReaction`;
    input.id = optId;
    input.checked = state.slowReactionAnswers[service.id] === value;
    input.addEventListener("change", () => {
      state.slowReactionAnswers[service.id] = value;
      saveSlowReactionAnswers();
      render();
    });
    optWrap.appendChild(input);

    const text = document.createElement("span");
    text.textContent = t(key);
    optWrap.appendChild(text);

    options.appendChild(optWrap);
  });

  wrap.appendChild(options);
  return wrap;
}

// -----------------------------------------------------------------------
// NOUVEAU : rendu des questions complémentaires BACS "extra vraag" VEKA.
// Réutilise volontairement le même design que la question "réaction
// lente ?" ci-dessus (classes .slow-reaction-question / -label / -options
// / -option) pour les sous-questions, et le design d'une carte de service
// standard (.service-card) pour les questions autonomes.
// -----------------------------------------------------------------------
/** Les deux boutons radio Oui/Non communs aux sous-questions et questions autonomes VEKA. */
function renderVekaYesNoOptions(question) {
  const options = document.createElement("div");
  options.className = "slow-reaction-question-options";

  [
    { value: true, key: "YES", fallback: "Oui" },
    { value: false, key: "NO", fallback: "Non" }
  ].forEach(({ value, key, fallback }) => {
    const optId = `veka__${question.id}__${value}`;
    const optWrap = document.createElement("label");
    optWrap.className = "slow-reaction-option";
    optWrap.setAttribute("for", optId);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `veka__${question.id}`;
    input.id = optId;
    input.checked = state.vekaAnswers[question.id] === value;
    input.addEventListener("change", () => {
      state.vekaAnswers[question.id] = value;
      saveVekaAnswers();
      render();
    });
    optWrap.appendChild(input);

    const text = document.createElement("span");
    text.textContent = t(key, fallback);
    optWrap.appendChild(text);

    options.appendChild(optWrap);
  });

  return options;
}
/** Petit indicateur de statut (Oui / Non / Aucune réponse) pour une question VEKA. */
function updateVekaStatus(question, statusEl) {
  if (!statusEl) return;
  const answer = state.vekaAnswers[question.id];
  statusEl.classList.remove("status-ok", "status-na", "status-pending");
  if (answer === undefined) {
    statusEl.textContent = t("VEKA_STATUS_PENDING", "Aucune réponse");
    statusEl.classList.add("status-pending");
  } else if (answer === true) {
    statusEl.textContent = t("YES", "Oui");
    statusEl.classList.add("status-ok");
  } else {
    statusEl.textContent = t("NO", "Non");
    statusEl.classList.add("status-na");
  }
}
/** Sous-question VEKA rattachée à un service existant (design "réaction lente ?"). */
function renderVekaQuestionBlock(question) {
  const wrap = document.createElement("div");
  wrap.className = "slow-reaction-question veka-question";
  wrap.dataset.vekaId = question.id;

  const badge = document.createElement("span");
  badge.className = "badge badge-veka";
  badge.textContent = t("VEKA_BADGE", "VEKA");

  const label = document.createElement("p");
  label.className = "slow-reaction-question-label";
  label.appendChild(badge);
  label.appendChild(document.createTextNode(" " + t(question.labelKey, question.id)));
  wrap.appendChild(label);

  wrap.appendChild(renderVekaYesNoOptions(question));

  const status = document.createElement("div");
  status.className = "service-status veka-question-status";
  updateVekaStatus(question, status);
  wrap.appendChild(status);

  return wrap;
}
/** Question VEKA autonome (nouveau "service" Oui/Non), affichée comme une carte de service. */
function renderVekaStandaloneCard(question) {
  const card = document.createElement("article");
  card.className = "service-card veka-standalone-card";
  card.dataset.vekaId = question.id;

  const header = document.createElement("div");
  header.className = "service-header";

  const idBadge = document.createElement("span");
  idBadge.className = "service-id badge-veka";
  idBadge.textContent = t("VEKA_BADGE", "VEKA");
  header.appendChild(idBadge);

  const title = document.createElement("h3");
  title.className = "service-title";
  title.textContent = t(question.labelKey, question.id);
  header.appendChild(title);

  card.appendChild(header);
  card.appendChild(renderVekaYesNoOptions(question));

  const status = document.createElement("div");
  status.className = "service-status";
  updateVekaStatus(question, status);
  card.appendChild(status);

  return card;
}
/**
 * Ajoute une question VEKA (sous-question rattachée à un service) dans
 * `container`, uniquement si elle est actuellement visible (voir
 * isVekaQuestionVisible). Aucune cascade : chaque question VEKA est
 * indépendante des autres.
 */
function renderVekaQuestionIfVisible(question, container) {
  if (!isVekaQuestionVisible(question)) return;
  container.appendChild(renderVekaQuestionBlock(question));
}

function renderLevelOption(service, lvl, disabled) {
  const optId = `${service.id}__lvl${lvl.level}`;
  const wrapper = document.createElement("label");
  wrapper.className = "level-option" + (disabled ? " level-option-disabled" : "");
  wrapper.setAttribute("for", optId);

  const input = document.createElement("input");
  input.type = "radio";
  input.name = service.id;
  input.id = optId;
  input.value = String(lvl.level);
  input.checked = !disabled && state.selections[service.id] === lvl.level;
  input.disabled = !!disabled;

  input.addEventListener("change", () => {
    if (disabled) return;
    state.selections[service.id] = lvl.level;
    saveSelections();

    // NOUVEAU : si ce service a un niveau lié à la question "réaction lente ?"
    // (H1 / C1), on refait un rendu complet de la carte pour faire apparaître
    // ou disparaître la question selon le niveau sélectionné.
    const hasSlowReactionLevel = service.levels.some((l) => l.slowReactionQuestion);
    if (hasSlowReactionLevel) {
      render();
      return;
    }

    const card = document.querySelector(`[data-service-id="${CSS.escape(service.id)}"]`);
    if (card) {
      const status = card.querySelector('[data-role="status"]');
      updateServiceStatus(service, status);
      card.querySelectorAll(".level-option").forEach((el) => el.classList.remove("selected"));
      wrapper.classList.add("selected");
    }

    refreshDomainSidebar();
    refreshPager();
  });

  wrapper.appendChild(input);

  const content = document.createElement("span");
  content.className = "level-content";

  const levelNum = document.createElement("span");
  levelNum.className = "level-num";
  levelNum.textContent = lvl.level;
  content.appendChild(levelNum);

  const levelLabel = document.createElement("span");
  levelLabel.className = "level-label";
  levelLabel.textContent = t(
    lvl.labelKey,
    tf("LEVEL_FALLBACK_TEMPLATE", { level: lvl.level }, `Niveau ${lvl.level}`)
  );
  content.appendChild(levelLabel);

  // NOUVEAU : pour un niveau lié à la question "réaction lente ?" (H1/C1,
  // niveau 3), le badge affiche la classe effective (A si réaction lente
  // confirmée, B sinon/par défaut) plutôt que la classe brute des données.
  const effectiveNormClassForBadge = getEffectiveNormClass(service, lvl);
  if (effectiveNormClassForBadge) {
    const normBadge = document.createElement("span");
    normBadge.className = `badge badge-norm badge-norm-${effectiveNormClassForBadge}`;
    normBadge.textContent = effectiveNormClassForBadge;
    content.appendChild(normBadge);
  }

  wrapper.appendChild(content);

  if (input.checked) wrapper.classList.add("selected");

  return wrapper;
}

function updateServiceStatus(service, statusEl) {
  if (!statusEl) return;

  if (state.notApplicable[service.id]) {
    statusEl.textContent = t("STATUS_NA", "Service non applicable à ce bâtiment");
    statusEl.classList.remove("status-ok", "status-pending");
    statusEl.classList.add("status-na");
    return;
  }

  const selected = state.selections[service.id];
  if (selected === undefined || selected === null) {
    statusEl.textContent = t("STATUS_PENDING", "Aucun niveau sélectionné");
    statusEl.classList.remove("status-ok", "status-na");
    statusEl.classList.add("status-pending");
  } else {
    const lvl = service.levels.find((l) => l.level === selected);
    const levelLabel = lvl
      ? t(lvl.labelKey, tf("LEVEL_FALLBACK_TEMPLATE", { level: selected }, `Niveau ${selected}`))
      : tf("LEVEL_FALLBACK_TEMPLATE", { level: selected }, `Niveau ${selected}`);
    statusEl.textContent = tf(
      "STATUS_SELECTED_TEMPLATE",
      { level: selected, label: levelLabel },
      `Sélectionné — Niveau ${selected} : ${levelLabel}`
    );
    statusEl.classList.remove("status-pending", "status-na");
    statusEl.classList.add("status-ok");
  }
}

// -----------------------------------------------------------------------
// Page Résultats
// -----------------------------------------------------------------------

function renderResultsScreen() {
  const wrap = document.createElement("div");
  wrap.className = "results-screen";

  const title = document.createElement("h1");
  title.className = "results-title";
  title.textContent = t("RESULTS_TITLE", "Résultats");
  wrap.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "results-subtitle";
  subtitle.textContent = t(
    "RESULTS_SUBTITLE",
    "Synthèse des méthodes sélectionnées pour ce bâtiment, sur la base des niveaux renseignés."
  );
  wrap.appendChild(subtitle);

  objectives.forEach((obj) => {
    if (!state.selectedObjectives.includes(obj.id)) return;

    if (obj.id === "GRO") {
      wrap.appendChild(renderGroResultsSection());
    } else if (obj.id === "ISO52120") {
      wrap.appendChild(renderNormResultsSection());
    } else if (obj.id === "BACS") {
      wrap.appendChild(renderBacsResultsSection());
    } else if (obj.id === "SRI") {
      wrap.appendChild(renderSriResultsSection());
    } else {
      wrap.appendChild(renderComingSoonSection(obj));
    }
  });

  return wrap;
}

function renderComingSoonSection(obj) {
  const section = document.createElement("section");
  section.className = "results-section placeholder-section";
  section.style.setProperty("--accent", obj.accent || "#0087b7");

  const header = document.createElement("h2");
  header.className = "results-section-title";
  header.textContent = `${obj.icon} ${t(obj.titleKey, obj.id)}`;
  section.appendChild(header);

  const msg = document.createElement("p");
  msg.className = "coming-soon-msg";
  msg.textContent = t("COMING_SOON", "Calcul disponible prochainement");
  section.appendChild(msg);

  return section;
}

function renderNormResultsSection() {
  const results = computeNormResults();
  const isoObj = objectives.find((o) => o.id === "ISO52120");

  const section = document.createElement("section");
  section.className = "results-section";
  section.style.setProperty("--accent", isoObj ? isoObj.accent : "#0087b7");

  const header = document.createElement("h2");
  header.className = "results-section-title";
  header.textContent = `${isoObj ? isoObj.icon : "📐"} ${
    isoObj ? t(isoObj.titleKey, isoObj.id) : "ISO 52120-1"
  }`;
  section.appendChild(header);

  const targetChip = document.createElement("div");
  targetChip.className = "target-chip";
  targetChip.textContent = `${t("REACH", "Classe souhaitée pour la norme")} : ${results.target}`;
  section.appendChild(targetChip);

  const globalCard = document.createElement("div");
  globalCard.className = "result-global-card";

  const globalBadge = document.createElement("span");
  globalBadge.className =
    "result-letter-badge" + (results.globalClass ? ` badge-norm-${results.globalClass}` : " result-letter-badge-empty");
  globalBadge.textContent = results.globalClass || "—";
  globalCard.appendChild(globalBadge);

  const globalLabel = document.createElement("span");
  globalLabel.className = "result-global-label";
  globalLabel.textContent = t("RESULT_GLOBAL_LABEL", "Résultat global du bâtiment");
  globalCard.appendChild(globalLabel);

  section.appendChild(globalCard);

  const grid = document.createElement("div");
  grid.className = "domain-result-grid";

  results.domainResults.forEach((dr) => {
    const card = document.createElement("div");
    card.className = "domain-result-card";

    const domainTitle = document.createElement("div");
    domainTitle.className = "domain-result-title";
    domainTitle.textContent = `${dr.domain.icon || ""} ${t(dr.domain.titleKey, dr.domain.key)}`.trim();
    card.appendChild(domainTitle);

    const badge = document.createElement("span");
    badge.className =
      "result-letter-badge" + (dr.domainClass ? ` badge-norm-${dr.domainClass}` : " result-letter-badge-empty");
    badge.textContent = dr.domainClass || "—";
    card.appendChild(badge);

    const countLabel = document.createElement("span");
    countLabel.className = "domain-result-count";
    countLabel.textContent = tf(
      "RESULT_DOMAIN_EVALUATED_TEMPLATE",
      { done: dr.answeredCount, total: dr.total },
      `${dr.answeredCount}/${dr.total} services pris en compte`
    );
    card.appendChild(countLabel);

    grid.appendChild(card);
  });

  section.appendChild(grid);

  const failTitle = document.createElement("h3");
  failTitle.className = "fail-list-title";
  failTitle.textContent = tf(
    "FAILING_SERVICES_TITLE_TEMPLATE",
    { target: results.target },
    `Services n'atteignant pas la classe visée (${results.target})`
  );
  section.appendChild(failTitle);

  if (results.failingServices.length === 0) {
    const okMsg = document.createElement("p");
    okMsg.className = "fail-list-empty";
    okMsg.textContent = t("FAILING_SERVICES_EMPTY", "Tous les services évalués atteignent la classe visée 🎉");
    section.appendChild(okMsg);
  } else {
    const list = document.createElement("div");
    list.className = "fail-list";

  results.failingServices.forEach(({ service, level, domain, isOrGroup }) => {
        const item = document.createElement("div");
        item.className = "fail-item" + (isOrGroup ? " fail-item-or-group" : "");

        const domainIcon = document.createElement("span");
        domainIcon.className = "fail-item-domain-icon";
        domainIcon.textContent = domain.icon || "▪";
        item.appendChild(domainIcon);

        const idBadge = document.createElement("span");
        idBadge.className = "service-id";
        idBadge.textContent = service.id;
        item.appendChild(idBadge);

        const name = document.createElement("span");
        name.className = "fail-item-name";
        // service.name existe pour le pseudo-service du groupe OR (pas de titleKey)
        name.textContent = isOrGroup
          ? service.name
          : t(service.titleKey, service.id);
        item.appendChild(name);

        if (isOrGroup) {
          const orBadge = document.createElement("span");
          orBadge.className = "badge badge-or-group";
          orBadge.textContent = t("OR_GROUP_LABEL", "OR — aucun des trois ne passe");
          item.appendChild(orBadge);
        } else {
          const classBadge = document.createElement("span");
          classBadge.className = `badge badge-norm badge-norm-${level.normClass}`;
          classBadge.textContent = level.normClass;
          item.appendChild(classBadge);
        }

        list.appendChild(item);
    });

    section.appendChild(list);
  }

  return section;
}

function renderBacsResultsSection() {
  const results = computeBacsResults();
  const bacsObj = objectives.find((o) => o.id === "BACS");

  const section = document.createElement("section");
  section.className = "results-section";
  section.style.setProperty("--accent", bacsObj ? bacsObj.accent : "#b3261e");

  const header = document.createElement("h2");
  header.className = "results-section-title";
  header.textContent = `${bacsObj ? bacsObj.icon : "🏢"} ${
    bacsObj ? t(bacsObj.titleKey, bacsObj.id) : "BACS"
  }`;
  section.appendChild(header);

  const globalCard = document.createElement("div");
  globalCard.className = "result-global-card";

  const globalBadge = document.createElement("span");
  const globalOk = results.globalTotal > 0 && results.globalAchieved === results.globalTotal;
  globalBadge.className =
    "result-count-badge" + (results.globalTotal > 0 ? (globalOk ? " result-count-ok" : " result-count-ko") : " result-letter-badge-empty");
  globalBadge.textContent = results.globalTotal > 0 ? `${results.globalAchieved}/${results.globalTotal}` : "—";
  globalCard.appendChild(globalBadge);

  const globalLabel = document.createElement("span");
  globalLabel.className = "result-global-label";
  globalLabel.textContent = t("BACS_GLOBAL_LABEL", "Conformité BACS globale du bâtiment");
  globalCard.appendChild(globalLabel);

  section.appendChild(globalCard);

  const grid = document.createElement("div");
  grid.className = "domain-result-grid";

  results.domainResults.forEach((dr) => {
    const card = document.createElement("div");
    card.className = "domain-result-card";

    const domainTitle = document.createElement("div");
    domainTitle.className = "domain-result-title";
    domainTitle.textContent = `${dr.domain.icon || ""} ${t(dr.domain.titleKey, dr.domain.key)}`.trim();
    card.appendChild(domainTitle);

    const domainOk = dr.consideredCount > 0 && dr.achievedCount === dr.consideredCount;
    const badge = document.createElement("span");
    badge.className =
      "result-count-badge" +
      (dr.consideredCount > 0 ? (domainOk ? " result-count-ok" : " result-count-ko") : " result-letter-badge-empty");
    badge.textContent = dr.consideredCount > 0 ? `${dr.achievedCount}/${dr.consideredCount}` : "—";
    card.appendChild(badge);

    const countLabel = document.createElement("span");
    countLabel.className = "domain-result-count";
    countLabel.textContent = tf(
      "RESULT_DOMAIN_BACS_TEMPLATE",
      { done: dr.achievedCount, total: dr.consideredCount },
      `${dr.achievedCount}/${dr.consideredCount} services conformes`
    );
    card.appendChild(countLabel);

    grid.appendChild(card);
  });

  section.appendChild(grid);

  const failTitle = document.createElement("h3");
  failTitle.className = "fail-list-title";
  failTitle.textContent = t("FAILING_BACS_TITLE", "Services n'atteignant pas le niveau BACS requis");
  section.appendChild(failTitle);

  if (results.failingServices.length === 0) {
    const okMsg = document.createElement("p");
    okMsg.className = "fail-list-empty";
    okMsg.textContent = t(
      "FAILING_BACS_EMPTY",
      "Tous les services évalués atteignent le niveau BACS requis 🎉"
    );
    section.appendChild(okMsg);
  } else {
    const list = document.createElement("div");
    list.className = "fail-list";

    results.failingServices.forEach(({ service, domain, achievedLevel, targetLevel }) => {
      const item = document.createElement("div");
      item.className = "fail-item";

      const domainIcon = document.createElement("span");
      domainIcon.className = "fail-item-domain-icon";
      domainIcon.textContent = domain.icon || "▪";
      item.appendChild(domainIcon);

      const idBadge = document.createElement("span");
      idBadge.className = "service-id";
      idBadge.textContent = service.id;
      item.appendChild(idBadge);

      const name = document.createElement("span");
      name.className = "fail-item-name";
      name.textContent = t(service.titleKey, service.id);
      item.appendChild(name);

      const levelsWrap = document.createElement("span");
      levelsWrap.className = "fail-item-levels";

      const reachedBadge = document.createElement("span");
      reachedBadge.className = "badge badge-level-reached";
      reachedBadge.textContent = `${t("LEVEL_REACHED_LABEL", "Niveau atteint")} : ${achievedLevel}`;
      levelsWrap.appendChild(reachedBadge);

      const targetBadge = document.createElement("span");
      targetBadge.className = "badge badge-level-target";
      targetBadge.textContent = `${t("LEVEL_REQUIRED_LABEL", "Niveau requis")} : ${targetLevel}`;
      levelsWrap.appendChild(targetBadge);

      item.appendChild(levelsWrap);

      list.appendChild(item);
    });

    section.appendChild(list);
  }

  // NOUVEAU : synthèse des questions complémentaires BACS "extra vraag"
  // VEKA (voir computeVekaBacsResults). N'apparaît que si au moins une
  // question VEKA est actuellement visible/applicable.
  const vekaResults = computeVekaBacsResults();
  if (vekaResults.total > 0) {
    const vekaTitle = document.createElement("h3");
    vekaTitle.className = "fail-list-title";
    vekaTitle.textContent = t("VEKA_SECTION_TITLE", "Questions complémentaires BACS (VEKA)");
    section.appendChild(vekaTitle);

    const vekaCountLabel = document.createElement("p");
    vekaCountLabel.className = "domain-result-count";
    vekaCountLabel.textContent = tf(
      "VEKA_SECTION_COUNT_TEMPLATE",
      { done: vekaResults.achievedCount, total: vekaResults.total },
      `${vekaResults.achievedCount}/${vekaResults.total} questions répondues « Oui »`
    );
    section.appendChild(vekaCountLabel);

    if (vekaResults.failing.length === 0) {
      const okMsg = document.createElement("p");
      okMsg.className = "fail-list-empty";
      okMsg.textContent = t(
        "VEKA_SECTION_EMPTY",
        "Toutes les questions complémentaires VEKA répondues sont conformes 🎉"
      );
      section.appendChild(okMsg);
    } else {
      const vekaList = document.createElement("div");
      vekaList.className = "fail-list";

      vekaResults.failing.forEach((question) => {
        const item = document.createElement("div");
        item.className = "fail-item";

        const badge = document.createElement("span");
        badge.className = "service-id badge-veka";
        badge.textContent = t("VEKA_BADGE", "VEKA");
        item.appendChild(badge);

        const name = document.createElement("span");
        name.className = "fail-item-name";
        name.textContent = t(question.labelKey, question.id);
        item.appendChild(name);

        const answer = state.vekaAnswers[question.id];
        const answerBadge = document.createElement("span");
        answerBadge.className = "badge " + (answer === false ? "badge-level-target" : "badge-na");
        answerBadge.textContent =
          answer === false ? t("NO", "Non") : t("VEKA_STATUS_PENDING", "Aucune réponse");
        item.appendChild(answerBadge);

        vekaList.appendChild(item);
      });

      section.appendChild(vekaList);
    }
  }

  return section;
}

function renderGroResultsSection() {
  const results = computeGroResults();
  const groObj = objectives.find((o) => o.id === "GRO");

  const section = document.createElement("section");
  section.className = "results-section";
  section.style.setProperty("--accent", groObj ? groObj.accent : "#1a7f37");

  const header = document.createElement("h2");
  header.className = "results-section-title";
  header.textContent = `${groObj ? groObj.icon : "🏷️"} ${
    groObj ? t(groObj.titleKey, groObj.id) : "GRO"
  }`;
  section.appendChild(header);

  const targetChip = document.createElement("div");
  targetChip.className = "target-chip";
  targetChip.textContent = `${t("GRO_TARGET_LABEL", "Niveau visé")} : ${t(
    GRO_LEVEL_TRANSLATION_KEYS[results.target],
    results.target
  )}`;
  section.appendChild(targetChip);

  const criteriaChip = document.createElement("div");
  criteriaChip.className = "target-chip";
  const criteriaLabels = state.groSelectedCriteria.map((key) => {
    const criterion = GRO_CRITERIA.find((c) => c.key === key);
    return criterion ? t(criterion.labelKey, key) : key;
  });
  criteriaChip.textContent = `${t("GRO_CRITERIA_LABEL", "Critères retenus")} : ${
    criteriaLabels.length > 0 ? criteriaLabels.join(", ") : "—"
  }`;
  section.appendChild(criteriaChip);

  const globalCard = document.createElement("div");
  globalCard.className = "result-global-card gro-global-card";

  const achievedBadge = document.createElement("span");
  achievedBadge.className =
    "result-letter-badge gro-letter-badge" +
    (results.achievedLevel ? ` gro-badge-${results.achievedLevel}` : " result-letter-badge-empty");
  achievedBadge.textContent = results.achievedLevel
    ? t(GRO_LEVEL_TRANSLATION_KEYS[results.achievedLevel], results.achievedLevel)
    : "—";
  globalCard.appendChild(achievedBadge);

  const globalTextWrap = document.createElement("div");
  globalTextWrap.className = "gro-global-text";

  const globalLabel = document.createElement("span");
  globalLabel.className = "result-global-label";
  globalLabel.textContent = results.achievedLevel
    ? t("GRO_ACHIEVED_LABEL", "Niveau atteint")
    : t("GRO_NO_LEVEL_YET", "Aucun niveau atteint pour l'instant");
  globalTextWrap.appendChild(globalLabel);

  const statusChip = document.createElement("span");
  statusChip.className =
    "result-status-chip " + (results.targetAchieved ? "result-status-ok" : "result-status-ko");
  statusChip.textContent = results.targetAchieved
    ? t("GRO_STATUS_ACHIEVED", "Objectif atteint")
    : t("GRO_STATUS_NOT_ACHIEVED", "Objectif non atteint");
  globalTextWrap.appendChild(statusChip);

  globalCard.appendChild(globalTextWrap);
  section.appendChild(globalCard);

  const grid = document.createElement("div");
  grid.className = "domain-result-grid gro-stats-grid";

  const completionCard = document.createElement("div");
  completionCard.className = "domain-result-card";
  const completionTitle = document.createElement("div");
  completionTitle.className = "domain-result-title";
  completionTitle.textContent = t("GRO_ANSWERED_TEMPLATE", "{done}/{total} services répondus")
    .replace("{done}", results.answeredCount)
    .replace("{total}", results.total);
  completionCard.appendChild(completionTitle);
  grid.appendChild(completionCard);

  const basicCard = document.createElement("div");
  basicCard.className = "domain-result-card";
  const basicTitle = document.createElement("div");
  basicTitle.className = "domain-result-title";
  basicTitle.textContent = t("GRO_BASIC_PROGRESS_LABEL", "Services de base atteints");
  basicCard.appendChild(basicTitle);
  const basicCount = document.createElement("span");
  basicCount.className = "domain-result-count";
  basicCount.textContent = tf(
    "GRO_BASIC_PERCENT_TEMPLATE",
    {
      done: results.basicReachedCount,
      total: results.basicTotal,
      percent: Math.round(results.basicPercentage * 100)
    },
    `${results.basicReachedCount}/${results.basicTotal} services de base atteints (${Math.round(
      results.basicPercentage * 100
    )}%)`
  );
  basicCard.appendChild(basicCount);
  grid.appendChild(basicCard);

  const optionalCard = document.createElement("div");
  optionalCard.className = "domain-result-card";
  const optionalTitle = document.createElement("div");
  optionalTitle.className = "domain-result-title";
  optionalTitle.textContent = t("GRO_OPTIONAL_PROGRESS_LABEL", "Services optionnels atteints");
  optionalCard.appendChild(optionalTitle);
  const optionalCount = document.createElement("span");
  optionalCount.className = "domain-result-count";
  optionalCount.textContent = tf(
    "GRO_OPTIONAL_COUNT_TEMPLATE",
    { done: results.optionalReachedCount, total: results.optionalTotal },
    `${results.optionalReachedCount}/${results.optionalTotal} services optionnels atteints (minimum requis pour Excellent : 5)`
  );
  optionalCard.appendChild(optionalCount);
  grid.appendChild(optionalCard);

  section.appendChild(grid);

  const criteriaTitle = document.createElement("h3");
  criteriaTitle.className = "fail-list-title";
  criteriaTitle.textContent = t("GRO_CRITERIA_TITLE", "Critères par niveau");
  section.appendChild(criteriaTitle);

  const criteriaList = document.createElement("ul");
  criteriaList.className = "gro-criteria-list";
  [
    { key: "GRO_CRITERIA_GOOD", fallback: "Bien : tous les services répondus", met: results.allAnswered },
    {
      key: "GRO_CRITERIA_BETER",
      fallback: "Mieux : ≥ 50% des services de base atteints",
      met: results.allAnswered && results.basicPercentage >= 0.5
    },
    {
      key: "GRO_CRITERIA_EXCELLENT",
      fallback: "Excellent : ≥ 70% des services de base ET ≥ 5 services optionnels atteints",
      met: results.allAnswered && results.basicPercentage >= 0.7 && results.optionalReachedCount >= 5
    }
  ].forEach(({ key, fallback, met }) => {
    const li = document.createElement("li");
    li.className = "gro-criteria-item" + (met ? " gro-criteria-met" : "");
    const icon = document.createElement("span");
    icon.className = "gro-criteria-icon";
    icon.textContent = met ? "✓" : "○";
    li.appendChild(icon);
    const text = document.createElement("span");
    text.textContent = t(key, fallback);
    li.appendChild(text);
    criteriaList.appendChild(li);
  });
  section.appendChild(criteriaList);

  /*
  const failTitle = document.createElement("h3");
  failTitle.className = "fail-list-title";
  failTitle.textContent = t(
    "GRO_FAILING_BASIC_TITLE",
    "Services de base n'atteignant pas leur niveau requis"
  );
  section.appendChild(failTitle);

  if (results.basicFailing.length === 0) {
    const okMsg = document.createElement("p");
    okMsg.className = "fail-list-empty";
    okMsg.textContent = t(
      "GRO_FAILING_BASIC_EMPTY",
      "Tous les services de base répondus atteignent leur niveau requis 🎉"
    );
    section.appendChild(okMsg);
  } else {
    const list = document.createElement("div");
    list.className = "fail-list";

    results.basicFailing.forEach(({ service, threshold }) => {
      const item = document.createElement("div");
      item.className = "fail-item";

      const domain = activeDomains.find((d) => d.services.includes(service));

      const domainIcon = document.createElement("span");
      domainIcon.className = "fail-item-domain-icon";
      domainIcon.textContent = domain ? domain.icon || "▪" : "▪";
      item.appendChild(domainIcon);

      const idBadge = document.createElement("span");
      idBadge.className = "service-id";
      idBadge.textContent = service.id;
      item.appendChild(idBadge);

      const name = document.createElement("span");
      name.className = "fail-item-name";
      name.textContent = t(service.titleKey, service.id);
      item.appendChild(name);

      const selectedLevel = state.selections[service.id];
      const levelsWrap = document.createElement("span");
      levelsWrap.className = "fail-item-levels";

      const reachedBadge = document.createElement("span");
      reachedBadge.className = "badge badge-level-reached";
      reachedBadge.textContent = `${t("LEVEL_REACHED_LABEL", "Niveau atteint")} : ${
        selectedLevel !== undefined && selectedLevel !== null ? selectedLevel : "—"
      }`;
      levelsWrap.appendChild(reachedBadge);

      const targetBadge = document.createElement("span");
      targetBadge.className = "badge badge-level-target";
      targetBadge.textContent = `${t("LEVEL_REQUIRED_LABEL", "Niveau requis")} : ${threshold}`;
      levelsWrap.appendChild(targetBadge);

      item.appendChild(levelsWrap);

      list.appendChild(item);
     
    });
    section.appendChild(list);
  }
*/
  return section;
}

/** Formatte un score (0 à 1) en pourcentage, ou "—" si non applicable (null). */
function formatSriScore(score) {
  return score === null || score === undefined ? "—" : `${Math.round(score * 100)}%`;
}

function renderSriResultsSection() {
  const results = computeSriResults();
  const sriObj = objectives.find((o) => o.id === "SRI");
  const criteriaKeys = GRO_CRITERIA.map((c) => c.key);

  const section = document.createElement("section");
  section.className = "results-section";
  section.style.setProperty("--accent", sriObj ? sriObj.accent : "#7a3ec2");

  const header = document.createElement("h2");
  header.className = "results-section-title";
  header.textContent = `${sriObj ? sriObj.icon : "🧠"} ${sriObj ? t(sriObj.titleKey, sriObj.id) : "SRI"}`;
  section.appendChild(header);

  const buildingTypeChip = document.createElement("div");
  buildingTypeChip.className = "target-chip";
  buildingTypeChip.textContent = `${t("BUILD_TYPE", "Type de bâtiment")} : ${t(
    results.buildingType === "RES" ? "RES_BUILD" : "NRES",
    results.buildingType
  )}`;
  section.appendChild(buildingTypeChip);

  // ---- Score global -------------------------------------------------------
  const globalCard = document.createElement("div");
  globalCard.className = "result-global-card";

  const globalBadge = document.createElement("span");
  globalBadge.className =
    "result-letter-badge sri-score-badge" +
    (results.globalScore === null ? " result-letter-badge-empty" : "");
  globalBadge.textContent = formatSriScore(results.globalScore);
  globalCard.appendChild(globalBadge);

  const globalLabel = document.createElement("span");
  globalLabel.className = "result-global-label";
  globalLabel.textContent = t("SRI_GLOBAL_LABEL", "Score SRI global");
  globalCard.appendChild(globalLabel);

  section.appendChild(globalCard);

  // ---- Key Functionalities -------------------------------------------------
  const kfTitle = document.createElement("h3");
  kfTitle.className = "fail-list-title";
  kfTitle.textContent = t("SRI_KF_TITLE", "Fonctionnalités clés (Key Functionalities)");
  section.appendChild(kfTitle);

  const kfGrid = document.createElement("div");
  kfGrid.className = "domain-result-grid";
  ["KF1", "KF2", "KF3"].forEach((kfKey) => {
    const card = document.createElement("div");
    card.className = "domain-result-card";
    const title = document.createElement("div");
    title.className = "domain-result-title";
    title.textContent = t(kfKey, kfKey);
    card.appendChild(title);
    const value = document.createElement("span");
    value.className = "domain-result-count";
    value.textContent = formatSriScore(results.kfScores[kfKey]);
    card.appendChild(value);
    kfGrid.appendChild(card);
  });
  section.appendChild(kfGrid);

  /*
  // ---- Scores par critère (global) -----------------------------------------
  const criteriaTitle = document.createElement("h3");
  criteriaTitle.className = "fail-list-title";
  criteriaTitle.textContent = t("SRI_CRITERIA_SCORES_TITLE", "Scores par critère (global)");
  section.appendChild(criteriaTitle);

  const criteriaGrid = document.createElement("div");
  criteriaGrid.className = "domain-result-grid";
  GRO_CRITERIA.forEach(({ key, labelKey }) => {
    const card = document.createElement("div");
    card.className = "domain-result-card";
    const title = document.createElement("div");
    title.className = "domain-result-title";
    title.textContent = t(labelKey, key);
    card.appendChild(title);
    const value = document.createElement("span");
    value.className = "domain-result-count";
    value.textContent = formatSriScore(results.criterionScores[key]);
    card.appendChild(value);
    criteriaGrid.appendChild(card);
  });
  section.appendChild(criteriaGrid);
  */

  // ---- Tableau détaillé domaine x critère -----------------------------------
  const tableTitle = document.createElement("h3");
  tableTitle.className = "fail-list-title";
  tableTitle.textContent = t(
    "SRI_TABLE_TITLE",
    "Scores par domaine technique et par critère"
  );
  section.appendChild(tableTitle);

  const tableWrap = document.createElement("div");
  tableWrap.className = "sri-table-wrap";

  const table = document.createElement("table");
  table.className = "sri-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const domainHeadTh = document.createElement("th");
  domainHeadTh.textContent = t("DOM_TECH", "Domaines techniques");
  headRow.appendChild(domainHeadTh);
  GRO_CRITERIA.forEach(({ key, labelKey }) => {
    const th = document.createElement("th");
    th.textContent = t(labelKey, key);
    headRow.appendChild(th);
  });
  const domainScoreTh = document.createElement("th");
  domainScoreTh.className = "sri-table-domain-score-col";
  domainScoreTh.textContent = t("SRI_TABLE_DOMAIN_SCORE_COL", "Score domaine");
  headRow.appendChild(domainScoreTh);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  activeDomains.forEach((domain) => {
    const row = document.createElement("tr");
    const domainTh = document.createElement("th");
    domainTh.scope = "row";
    domainTh.textContent = `${domain.icon || ""} ${t(domain.titleKey, domain.key)}`.trim();
    row.appendChild(domainTh);

    criteriaKeys.forEach((criterion) => {
      const td = document.createElement("td");
      const cell = results.matrix[domain.key] && results.matrix[domain.key][criterion];
      td.textContent = cell ? formatSriScore(cell.score) : "—";
      row.appendChild(td);
    });

    const domainScoreTd = document.createElement("td");
    domainScoreTd.className = "sri-table-domain-score-col";
    domainScoreTd.textContent = formatSriScore(results.domainScores[domain.key]);
    row.appendChild(domainScoreTd);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  const tfoot = document.createElement("tfoot");
  const footRow = document.createElement("tr");
  const footTh = document.createElement("th");
  footTh.scope = "row";
  footTh.textContent = t("SRI_TABLE_GLOBAL_ROW", "Score global (critère)");
  footRow.appendChild(footTh);
  criteriaKeys.forEach((criterion) => {
    const td = document.createElement("td");
    td.textContent = formatSriScore(results.criterionScores[criterion]);
    footRow.appendChild(td);
  });
  const footGlobalTd = document.createElement("td");
  footGlobalTd.className = "sri-table-domain-score-col";
  footGlobalTd.textContent = formatSriScore(results.globalScore);
  footRow.appendChild(footGlobalTd);
  tfoot.appendChild(footRow);
  table.appendChild(tfoot);

  tableWrap.appendChild(table);
  section.appendChild(tableWrap);

  return section;
}

// -----------------------------------------------------------------------
// Navigation entre étapes (domaines actifs + résultats)
// -----------------------------------------------------------------------

function renderPager() {
  const pager = document.createElement("div");
  pager.className = "pager";
  pager.id = "pager";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "pager-arrow";
  prevBtn.id = "prev-domain-btn";
  prevBtn.innerHTML = "&larr;";
  prevBtn.title = t("PAGER_PREV_TITLE", "Précédent");
  prevBtn.addEventListener("click", () => goToDomain(state.activeDomainIndex - 1));
  pager.appendChild(prevBtn);

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "pager-dots";
  dotsWrap.id = "pager-dots";

  for (let index = 0; index < totalSteps(); index++) {
    const completion = getDomainCompletion(activeDomains[index]);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "pager-dot";
    if (index === state.activeDomainIndex) dot.classList.add("active");
    if (completion.done === completion.total && completion.total > 0) {
      dot.classList.add("complete");
    }
    dot.title = t(activeDomains[index].titleKey, activeDomains[index].key);
    dot.addEventListener("click", () => goToDomain(index));
    dotsWrap.appendChild(dot);
  }

  pager.appendChild(dotsWrap);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "pager-arrow";
  nextBtn.id = "next-domain-btn";
  nextBtn.innerHTML = "&rarr;";
  nextBtn.title = t("PAGER_NEXT_TITLE", "Suivant");
  nextBtn.addEventListener("click", () => goToDomain(state.activeDomainIndex + 1));
  pager.appendChild(nextBtn);

  const label = document.createElement("span");
  label.className = "pager-label";
  label.id = "pager-label";
  const currentTitle = activeDomains[state.activeDomainIndex]
    ? t(activeDomains[state.activeDomainIndex].titleKey, activeDomains[state.activeDomainIndex].key)
    : "";
  label.textContent = currentTitle ? `${currentTitle} — ${state.activeDomainIndex + 1}/${totalSteps()}` : "";
  pager.appendChild(label);

  applyPagerBoundState(pager);

  return pager;
}

function applyPagerBoundState(pagerEl) {
  const prevBtn = pagerEl.querySelector("#prev-domain-btn");
  const nextBtn = pagerEl.querySelector("#next-domain-btn");
  prevBtn.disabled = state.activeDomainIndex === 0;
  nextBtn.disabled = state.activeDomainIndex >= activeDomains.length - 1;
}

function refreshPager() {
  const oldPager = document.getElementById("pager");
  if (!oldPager) return;
  const newPager = renderPager();
  oldPager.replaceWith(newPager);
}

function refreshDomainSidebar() {
  const oldSidebar = document.getElementById("domain-sidebar");
  if (!oldSidebar) return;
  const newSidebar = renderDomainSidebar();
  oldSidebar.replaceWith(newSidebar);
}

function goToDomain(index) {
  if (index < 0 || index >= activeDomains.length) return;
  state.activeDomainIndex = index;
  saveActiveDomain();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -----------------------------------------------------------------------
// Barre de progression globale (domaines actifs uniquement, hors N/A)
// -----------------------------------------------------------------------

function updateProgress() {
  const bar = document.getElementById("progress-bar");
  const label = document.getElementById("progress-label");
  if (!bar || !label) return;

  const { done, total } = getOverallCompletion();

  bar.style.width = `${total ? (done / total) * 100 : 0}%`;
  label.textContent = tf(
    "PROGRESS_LABEL_TEMPLATE",
    { done, total },
    `${done} / ${total} services renseignés (tous domaines)`
  );
}

// -----------------------------------------------------------------------
// Barre d'outils
// -----------------------------------------------------------------------

function initToolbar() {
  document.getElementById("home-btn").addEventListener("click", goHome);

  const langSelect = document.getElementById("lang-select");
  langSelect.value = state.lang;
  langSelect.addEventListener("change", () => {
    state.lang = langSelect.value;
    localStorage.setItem(LANG_KEY, state.lang);
    render();
  });

  document.getElementById("export-btn").addEventListener("click", exportSelections);
  document.getElementById("import-input").addEventListener("change", importSelections);
  document.getElementById("reset-btn").addEventListener("click", resetSelections);
}

function exportSelections() {
  const payload = {
    exportedAt: new Date().toISOString(),
    buildingType: state.buildingType,
    selectedDomains: state.selectedDomains,
    objectives: state.selectedObjectives,
    isoTargetClass: state.isoTargetClass,
    groTarget: state.groTarget,
    notApplicable: state.notApplicable,
    selections: state.selections,
    slowReactionAnswers: state.slowReactionAnswers,
    vekaAnswers: state.vekaAnswers
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `selections_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importSelections(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state.selections = data.selections || {};
      state.notApplicable = data.notApplicable || {};
      state.slowReactionAnswers = data.slowReactionAnswers || {};
      state.vekaAnswers = data.vekaAnswers || {};

      if (data.buildingType === "RES" || data.buildingType === "NRES") {
        state.buildingType = data.buildingType;
        saveBuildingType();
      }

      if (Array.isArray(data.selectedDomains)) {
        const validKeys = new Set(domains.map((d) => d.key));
        const filtered = [...new Set(data.selectedDomains.filter((k) => validKeys.has(k)))];
        if (filtered.length > 0) {
          state.selectedDomains = filtered;
          saveSelectedDomains();
        }
      }

      if (data.isoTargetClass === "A" || data.isoTargetClass === "B" || data.isoTargetClass === "C") {
        state.isoTargetClass = data.isoTargetClass;
        saveIsoTargetClass();
      }

      if (GRO_LEVEL_ORDER.includes(data.groTarget)) {
        state.groTarget = data.groTarget;
        saveGroTarget();
      }

      if (Array.isArray(data.objectives) && data.objectives.length > 0) {
        const validIds = new Set(objectives.map((o) => o.id));
        state.selectedObjectives = [...new Set(data.objectives.filter((id) => validIds.has(id)))];
        saveSelectedObjectives();
        state.view = "evaluation";
        saveView();
      } else if (data.objective) {
        state.selectedObjectives = [data.objective];
        saveSelectedObjectives();
        state.view = "evaluation";
        saveView();
      }

      saveSelections();
      saveNotApplicable();
      saveSlowReactionAnswers();
      saveVekaAnswers();
      render();
    } catch (e) {
      alert(t("ALERT_INVALID_JSON", "Fichier JSON invalide : ") + e.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetSelections() {
  if (!confirm(t("CONFIRM_RESET", "Réinitialiser toutes les sélections ?"))) return;
  state.selections = {};
  state.notApplicable = {};
  state.slowReactionAnswers = {};
  state.vekaAnswers = {};
  saveSelections();
  saveNotApplicable();
  saveSlowReactionAnswers();
  saveVekaAnswers();
  render();
}

// -----------------------------------------------------------------------
// Raccourcis clavier
// -----------------------------------------------------------------------

function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    if (state.view !== "evaluation") return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

    if (e.key === "ArrowRight") goToDomain(state.activeDomainIndex + 1);
    if (e.key === "ArrowLeft") goToDomain(state.activeDomainIndex - 1);
  });
}

// -----------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initToolbar();
  initKeyboardNav();
  render();
});
