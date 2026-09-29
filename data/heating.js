/**
 * heating.js
 * -----------------------------------------------------------------------
 * Domain: Heating (H)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "H", "BACS-3R"
 * * Domain: Heating (H)
 * Source: TOOL_ISO52120+SRI_leeg_v0.4.xlsm — onglet "H"
 *
 * Schéma commun à chaque service :
 * {
 *   id,            // identifiant du service (ex: "H1")
 *   domain,        // domaine technique ("heating")
 *   titleKey,      // clé de traduction du nom du service (onglet Translation)
 *   exprKey,       // clé de traduction de la description/explication (optionnel)
 *   sriCode,       // code SRI (ex: "H-1a") ou null si non applicable
 *   normCode,      // code de la norme ISO 52120 (ex: "HEAT_EMIS_CTRL_DEF") ou null
 *   applicableFor, // ["SRI", "ISO52120", "GRO"]
 *   triage,        // true si le service fait partie des services de triage
 *   levels: [
 *     {
 *       level,       // niveau de fonctionnalité (0 à 4)
 *       labelKey,    // clé de traduction du libellé du niveau (onglet Translation)
 *       remarkKey,   // clé de traduction d'une remarque optionnelle liée au niveau
 *       normClass,   // classe norme atteinte à ce niveau (D, C, B, A) ou null
 *       sriScores: { // scores SRI par critère pour ce niveau (0 si non applicable)
 *         energyEfficiency,
 *         flexibility,
 *         comfort,
 *         convenience,
 *         health,
 *         maintenance,
 *         information
 *       } // ou null si le service n'est pas évalué pour le SRI
 *     },
 *     ...
 *   ],
 *   gro: {          // seuils GRO (onglet GRO-calc), absent si non applicable
 *     basic: [ { level } ],
 *     optional: [ { level } ]
 *   },
 * bacs: [ { level } ]
 * }
 * -----------------------------------------------------------------------
 * Champ `bacs` : { level } = niveau de fonctionnalité minimal à atteindre
 * pour ce service selon la méthode BACS (onglet BACS-3R). Absent si le
 * service n'est pas repris dans la méthode BACS (colonne "BACS included" = x).
 * -----------------------------------------------------------------------
 */

export const H1 = {
  id: "H1", domain: "heating", titleKey: "H1", exprKey: "H1_expl",
  sriCode: "H-1a", normCode: "HEAT_EMIS_CTRL_DEF",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "H10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H11", normClass: "D", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H12", normClass: "C", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 2, health: 2, maintenance: 0, information: 0 } },
    // NOUVEAU : au niveau 3, la classe de la norme dépend du type de système d'émission.
    // - Réaction lente  -> classe A
    // - Réaction rapide (par défaut / non répondu) -> classe B
    // Voir slowReactionNormClass (utilisé par getEffectiveNormClass dans app.js).
    { level: 3, labelKey: "H13", remarkKey: "H132", normClass: "B", slowReactionQuestion: true, slowReactionNormClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 0 } },
    { level: 4, labelKey: "H14", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 0 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 2 }
};

export const H2 = {
  id: "H2", domain: "heating", titleKey: "H2", exprKey: null,
  sriCode: "H-1b", normCode: "HEAT_EMIS_CTRL_TABS",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "H20", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H21", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H22", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 2, health: 2, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H231", remarkKeys: ["H232", "H233", "H234"], normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 1 } }
  ],
  gro: { optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const H3 = {
  id: "H3", domain: "heating", titleKey: "H3", exprKey: "H3_expl",
  sriCode: "H-1c", normCode: "HEAT_DISTR_CTRL_TMP",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "H30", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H31", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H32", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] },
  bacs: { level: 1 }
};

export const H4 = {
  id: "H4", domain: "heating", titleKey: "H4", exprKey: "H4_expl",
  sriCode: "H-1d", normCode: "HEAT_DISTR_CTRL_PMP",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "H40", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H41", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H42", normClass: "C", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H43", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "H44", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 3 }] },
  bacs: { level: 3 }
};

export const H4a = {
  id: "H4a", domain: "heating", titleKey: "H4a", exprKey: "H4a_expl",
  sriCode: null, normCode: "HEAT_CTRL_DISTR_HYDR",
  applicableFor: ["ISO52120"], triage: false,
  levels: [
    { level: 0, labelKey: "H4a0", normClass: "D", sriScores: null },
    { level: 1, labelKey: "H4a1", normClass: "D", sriScores: null },
    { level: 2, labelKey: "H4a2", normClass: "D", sriScores: null },
    { level: 3, labelKey: "H4a3", normClass: "C", sriScores: null },
    { level: 4, labelKey: "H4a4", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const H5 = {
  id: "H5", domain: "heating", titleKey: "H5", exprKey: "H5_expl",
  sriCode: null, normCode: "HEAT_DISTR_CTRL",
  applicableFor: ["ISO52120"], triage: false,
  levels: [
    { level: 0, labelKey: "H50", normClass: "D", sriScores: null },
    { level: 1, labelKey: "H51", normClass: "C", sriScores: null },
    { level: 2, labelKey: "H52", normClass: "B", sriScores: null },
    { level: 3, labelKey: "H53", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const H6 = {
  id: "H6", domain: "heating", titleKey: "H6", exprKey: "H6_expl",
  sriCode: "H-2a", normCode: "HEAT_GEN_CTRL_CD",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "H60", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H61", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H62", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] },
  bacs: { level: 2 }
};

export const H7 = {
  id: "H7", domain: "heating", titleKey: "H7", exprKey: "H7_expl",
  sriCode: null, normCode: "HEAT_GEN_CTRL_HP",
  applicableFor: ["ISO52120", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "H70", normClass: "D", sriScores: null },
    { level: 1, labelKey: "H71", normClass: "C", sriScores: null },
    { level: 2, labelKey: "H72", normClass: "A", sriScores: null }
  ],
  bacs: { level: 2 }
};

export const H8 = {
  id: "H8", domain: "heating", titleKey: "H8", exprKey: "H8_expl",
  sriCode: "H-2b", normCode: "HEAT_GEN_CTRL_OU",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "H80", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H81", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 1, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H82", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 2, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H83", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 2, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const H9 = {
  id: "H9", domain: "heating", titleKey: "H9", exprKey: "H9_expl",
  sriCode: "H-2d", normCode: "HEAT_GEN_CTRL_SEQ",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "H90", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H91", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H92", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H93", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "H94", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 3, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const H_10 = {
  id: "H_10", domain: "heating", titleKey: "H_10", exprKey: "H10_expl",
  sriCode: "H-1f", normCode: "HEAT_TES_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "H100", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H101", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H102", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H103", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 1 }] },
  bacs: { level: 2 }
};

export const H_11 = {
  id: "H_11", domain: "heating", titleKey: "H_11", exprKey: null,
  sriCode: "H-3", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: true,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "H110", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H111", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "H112", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "H113", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "H114", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 3, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 3 }
};

export const H_12 = {
  id: "H_12", domain: "heating", titleKey: "H_12", exprKey: null,
  sriCode: "H-4", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "H120", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "H121", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "H122", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 2, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "H123", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 2, convenience: 3, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "H124", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 3, convenience: 3, health: 1, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const heatingServices = [H1, H2, H3, H4, H4a, H5, H6, H7, H8, H9, H_10, H_11, H_12];

export default heatingServices;
