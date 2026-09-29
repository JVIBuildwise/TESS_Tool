/**
 * vekaExtra.js
 * -----------------------------------------------------------------------
 * Intégration des "extra vraag" VEKA (questions complémentaires à réponse
 * Oui/Non, propres à la méthode BACS), voir le fichier source
 * "260918_Intégration VEKA outil HTML.xlsx".
 *
 * Chaque question VEKA a un `kind` :
 *  - "standalone"  : nouveau "service" Oui/Non à part entière, affiché en
 *                    fin de liste du domaine technique indiqué (`domain`),
 *                    uniquement quand la méthode BACS est sélectionnée.
 *  - "subquestion" : question Oui/Non rattachée à un service EXISTANT
 *                    (H_11, C_11, V_11 ou MC2), affichée sous ce service —
 *                    même design que la question "réaction lente ?" — dès
 *                    que le niveau sélectionné pour ce service est
 *                    supérieur ou égal à `fromLevel` (colonne F du fichier
 *                    Excel : "vanaf niveau X"). Une même question peut être
 *                    rattachée à PLUSIEURS services (ex : A3 sous H_11 ET
 *                    sous C_11) via plusieurs entrées dans `parents` : la
 *                    réponse est alors partagée entre les deux emplacements.
 *
 * Champ `bacsRequired` : indique que la question fait partie du corpus
 * BACS-3R + VEKA et doit donc être reprise dans la synthèse des résultats
 * BACS (voir computeVekaBacsResults dans app.js).
 * ⚠️ ASSOMPTION À VALIDER (comme pour les autres notes "À valider" du
 * projet) : en l'absence de règle de calcul officielle communiquée par
 * VEKA, on considère qu'une réponse "Oui" est conforme et qu'une réponse
 * "Non" ou une question non répondue est listée comme non conforme dans
 * les résultats BACS, au même titre que les autres services BACS. Le
 * statut n'impacte PAS le compteur global "X/Y services conformes"
 * existant (qui reste basé uniquement sur les services à niveaux) : il est
 * affiché dans une sous-section dédiée "Questions complémentaires BACS
 * (VEKA)". À confirmer avec toi si un autre comportement est souhaité.
 * -----------------------------------------------------------------------
 */

export const vekaExtraQuestions = [
  // --- A2 : compteurs électriques relevés au moins par quart d'heure ------
  {
    id: "A2",
    vekaCode: "A2",
    labelKey: "VEKA_A2",
    kind: "standalone",
    domain: "electricity",
    bacsRequired: true
  },

  // --- A3 : compteurs relevés au moins sur base horaire -------------------
  // Sous-question des services de reporting H_11 (chauffage) et C_11
  // (refroidissement), visible à partir du niveau 2 sur l'un ou l'autre.
  {
    id: "A3",
    vekaCode: "A3",
    labelKey: "VEKA_A3",
    kind: "subquestion",
    parents: [
      { domain: "heating", serviceId: "H_11", fromLevel: 2 },
      { domain: "cooling", serviceId: "C_11", fromLevel: 2 }
    ],
    bacsRequired: true
  },

  // --- A4 : conservation des données (5 ans, granularité correcte) -------
  // Deux implémentations distinctes de la MÊME question source, comme
  // indiqué dans le fichier Excel (deux lignes "A4") :
  //  - une sous-question de H_11 / C_11 (comme A3), à partir du niveau 2 ;
  //  - une question autonome dans le domaine Électricité (pas de service
  //    de reporting équivalent existant dans ce domaine).
  {
    id: "A4_HC",
    vekaCode: "A4",
    labelKey: "VEKA_A4",
    kind: "subquestion",
    parents: [
      { domain: "heating", serviceId: "H_11", fromLevel: 2 },
      { domain: "cooling", serviceId: "C_11", fromLevel: 2 }
    ],
    bacsRequired: true
  },
  {
    id: "A4_E",
    vekaCode: "A4",
    labelKey: "VEKA_A4",
    kind: "standalone",
    domain: "electricity",
    bacsRequired: true
  },

  // --- B2 : interopérabilité du BACS ---------------------------------------
  {
    id: "B2",
    vekaCode: "B2",
    labelKey: "VEKA_B2",
    kind: "standalone",
    domain: "mc",
    bacsRequired: true
  },

  // --- C3 : procédure de gestion des alarmes ------------------------------
  // Sous-question de MC2 (détection de défauts). Aucun niveau minimal
  // n'était précisé dans le fichier source (juste noté "ok") : la question
  // est donc affichée dès qu'un niveau (quel qu'il soit) est sélectionné
  // pour MC2 (fromLevel: 0).
  {
    id: "C3",
    vekaCode: "C3",
    labelKey: "VEKA_C3",
    kind: "subquestion",
    parents: [{ domain: "mc", serviceId: "MC2", fromLevel: 0 }],
    note: "Pas de niveau minimal précisé dans le fichier source (\"ok\").",
    bacsRequired: true
  },

  // --- G2 : mesure des paramètres intérieurs (temp./RV/CO2) ---------------
  // Deux implémentations, comme pour A4 :
  //  - sous-question de V_11 (reporting ventilation/IAQ), à partir du
  //    niveau 1 ;
  //  - question autonome dans le domaine MC.
  {
    id: "G2_V",
    vekaCode: "G2",
    labelKey: "VEKA_G2_V",
    kind: "subquestion",
    parents: [{ domain: "ventilation", serviceId: "V_11", fromLevel: 1 }],
    bacsRequired: true
  },
  {
    id: "G2_MC",
    vekaCode: "G2",
    labelKey: "VEKA_G2_MC",
    kind: "standalone",
    domain: "mc",
    bacsRequired: true
  },

  // --- G4 : conservation des données par quart d'heure (13 mois) ---------
  // Posée aux MÊMES emplacements que G2 (sous-question de V_11 à partir du
  // niveau 1, et question autonome du domaine MC), mais de façon
  // TOTALEMENT INDÉPENDANTE de G2 : il n'y a pas de cascade entre les deux
  // questions. G4 est donc toujours affichée en même temps que G2, quelle
  // que soit la réponse apportée à G2 (y compris "Non" ou pas encore
  // répondue).
  {
    id: "G4_V",
    vekaCode: "G4",
    labelKey: "VEKA_G4",
    kind: "subquestion",
    parents: [{ domain: "ventilation", serviceId: "V_11", fromLevel: 1 }],
    bacsRequired: true
  },
  {
    id: "G4_MC",
    vekaCode: "G4",
    labelKey: "VEKA_G4",
    kind: "standalone",
    domain: "mc",
    bacsRequired: true
  }
];

export default vekaExtraQuestions;
