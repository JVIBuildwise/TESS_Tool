/**
 * cooling.js
 * -----------------------------------------------------------------------
 * Domain: Cooling control (C)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "C", "GRO-calc", "BACS-3R"
 *
 * ⚠️ ASSOMPTION À VALIDER : dans l'onglet BACS-3R, la ligne "C_11" est bien
 * marquée comme incluse ("v") mais la colonne "Level to reach" est vide
 * (probablement un oubli dans le fichier source, encore "_inprogress").
 * Par analogie avec H_11 (service de reporting équivalent pour le chauffage,
 * qui exige le niveau 3), j'ai fixé C_11.bacs.level = 3. À confirmer avec toi.
 * -----------------------------------------------------------------------
 */

export const C1 = {
  id: "C1", domain: "cooling", titleKey: "C1", exprKey: "C1_expl",
  sriCode: "C-1a", normCode: "CLG_EMIS_CTRL_DEF",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "C10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C11", normClass: "D", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C12", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 2, health: 2, maintenance: 0, information: 0 } },
    // NOUVEAU : au niveau 3, la classe de la norme dépend du type de système d'émission.
    // - Réaction lente  -> classe A
    // - Réaction rapide (par défaut / non répondu) -> classe B
    // Voir slowReactionNormClass (utilisé par getEffectiveNormClass dans app.js).
    { level: 3, labelKey: "C131", remarkKey: "C132", normClass: "B", slowReactionQuestion: true, slowReactionNormClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 0 } },
    { level: 4, labelKey: "C14", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 0 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 2 }
};

export const C2 = {
  id: "C2", domain: "cooling", titleKey: "C2", exprKey: null,
  sriCode: "C-1b", normCode: "CLG_EMIS_CTRL_TABS",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "C20", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C21", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C22", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 2, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C231", remarkKeys: ["C232", "C233", "C234"], normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 1, information: 1 } }
  ],
  gro: { optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const C3 = {
  id: "C3", domain: "cooling", titleKey: "C3", exprKey: "C3_expl",
  sriCode: "C-1c", normCode: "CLG_DISTR_CTRL_TMP",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "C30", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C31", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C32", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 1 }], optional: [{ level: 2 }] },
  bacs: { level: 1 }
};

export const C4 = {
  id: "C4", domain: "cooling", titleKey: "C4", exprKey: "C4_expl",
  sriCode: "C-1d", normCode: "CLG_DISTR_CTRL_PMP",
  applicableFor: ["SRI", "ISO52120", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "C40", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C41", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C42", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C43", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "C44", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  // Non repris dans l'onglet GRO-calc (pas de seuil basic/optional défini)
  bacs: { level: 3 }
};

export const C4a = {
  id: "C4a", domain: "cooling", titleKey: "C4a", exprKey: "C4a_expl",
  sriCode: null, normCode: "CLG_CTRL_DISTR_HYDR",
  applicableFor: ["ISO52120"], 
  levels: [
    { level: 0, labelKey: "C4a0", normClass: "D", sriScores: null },
    { level: 1, labelKey: "C4a1", normClass: "D", sriScores: null },
    { level: 2, labelKey: "C4a2", normClass: "D", sriScores: null },
    { level: 3, labelKey: "C4a3", normClass: "C", sriScores: null },
    { level: 4, labelKey: "C4a4", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS ni GRO (BACS-3R : "x")
};

export const C5 = {
  id: "C5", domain: "cooling", titleKey: "C5", exprKey: "C5_expl",
  sriCode: null, normCode: "CLG_DISTR_CTRL",
  applicableFor: ["ISO52120"], 
  levels: [
    { level: 0, labelKey: "C50", normClass: "D", sriScores: null },
    { level: 1, labelKey: "C51", normClass: "C", sriScores: null },
    { level: 2, labelKey: "C52", normClass: "B", sriScores: null },
    { level: 3, labelKey: "C53", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const C6 = {
  id: "C6", domain: "cooling", titleKey: "C6", exprKey: "C6_expl",
  sriCode: "C-1f", normCode: "CLG_GEN_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "C60", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C61", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C62", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }] },
  bacs: { level: 1 }
};

export const C7 = {
  id: "C7", domain: "cooling", titleKey: "C7", exprKey: "C7_expl",
  sriCode: null, normCode: null,
  applicableFor: ["ISO52120", "BACS", "DIN"], 
  levels: [
    { level: 0, labelKey: "C70", normClass: "D", sriScores: null },
    { level: 1, labelKey: "C71", normClass: "B", sriScores: null },
    { level: 2, labelKey: "C72", normClass: "A", sriScores: null }
  ],
  // Non repris dans l'onglet GRO-calc
  bacs: { level: 2 }
};

export const C8 = {
  id: "C8", domain: "cooling", titleKey: "C8", exprKey: null,
  sriCode: "C-2a", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "C80", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C81", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 1, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C82", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 2, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C83", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 2, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }] }, // GRO bizarre, même niveau pour basic & optional
  bacs: { level: 2 }
};

export const C9 = {
  id: "C9", domain: "cooling", titleKey: "C9", exprKey: "C9_expl",
  sriCode: "C-2b", normCode: "CLG_GEN_CTRL_SEQ",
  applicableFor: ["SRI", "ISO52120", "BACS", "GRO"], triage: false,
  levels: [
    { level: 0, labelKey: "C90", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C91", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C92", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C93", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "C94", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 3, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  // GRO-calc indique ce service en "Optional" mais sans seuil renseigné : exclu du calcul GRO
  bacs: { level: 2 }
};

export const C_10 = {
  id: "C_10", domain: "cooling", titleKey: "C_10", exprKey: "C10_expl",
  sriCode: "C-1g", normCode: "CLG_TES_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "C100", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C101", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C102", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C103", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 1 }] },
  bacs: { level: 2 }
};

export const C_11 = {
  id: "C_11", domain: "cooling", titleKey: "C_11", exprKey: null,
  sriCode: "C-3", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: true,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "C110", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C111", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "C112", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "C113", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "C114", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 3, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 3 }
};

export const C_12 = {
  id: "C_12", domain: "cooling", titleKey: "C_12", exprKey: null,
  sriCode: "C-4", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "C120", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "C121", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "C122", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 2, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "C123", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 2, convenience: 3, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "C124", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 3, convenience: 3, health: 1, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const coolingServices = [C1, C2, C3, C4, C4a, C5, C6, C7, C8, C9, C_10, C_11, C_12];

export default coolingServices;
