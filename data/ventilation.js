/**
 * ventilation.js
 * -----------------------------------------------------------------------
 * Domain: Ventilation control (V)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "V", "GRO-calc", "BACS-3R"
 * -----------------------------------------------------------------------
 */

export const V1 = {
  id: "V1", domain: "ventilation", titleKey: "V1", exprKey: "V1_expl",
  sriCode: "V-1a", normCode: "VENT_RMFLOW_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "V10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V11", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "V12", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 2, convenience: 2, health: 2, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "V13", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 3, convenience: 3, health: 3, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "V14", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 3, convenience: 3, health: 3, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }], optional: [{ level: 4 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const V2 = {
  id: "V2", domain: "ventilation", titleKey: "V2", exprKey: "V2_expl",
  sriCode: null, normCode: "VENT_RTEMP_CTRL",
  applicableFor: ["ISO52120", "BACS", "DIN"], 
  levels: [
    { level: 0, labelKey: "V20", normClass: "D", sriScores: null },
    { level: 1, labelKey: "V21", normClass: "C", sriScores: null },
    { level: 2, labelKey: "V22", normClass: "A", sriScores: null }
  ],
  bacs: { level: 1 }
};

export const V3 = {
  id: "V3", domain: "ventilation", titleKey: "V3", exprKey: "V3_expl",
  sriCode: null, normCode: "VENT_RTEMP_COORD",
  applicableFor: ["ISO52120", "BACS"], 
  levels: [
    { level: 0, labelKey: "V30", normClass: "D", sriScores: null },
    { level: 1, labelKey: "V31", normClass: "A", sriScores: null }
  ],
  bacs: { level: 1 }
};

export const V4 = {
  id: "V4", domain: "ventilation", titleKey: "V4", exprKey: "V4_expl",
  sriCode: null, normCode: "VENT_OAFLOW_CTRL",
  applicableFor: ["ISO52120"], triage: false,
  levels: [
    { level: 0, labelKey: "V40", normClass: "C", sriScores: null },
    { level: 1, labelKey: "V41", normClass: "B", sriScores: null },
    { level: 2, labelKey: "V42", normClass: "B", sriScores: null },
    { level: 3, labelKey: "V43", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const V5 = {
  id: "V5", domain: "ventilation", titleKey: "V5", exprKey: null,
  sriCode: "V-1c", normCode: "VENT_AHUFLOW_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "V50", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V51", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "V52", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "V53", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "V54", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 4 }] },
  bacs: { level: 3 }
};

export const V6 = {
  id: "V6", domain: "ventilation", titleKey: "V6", exprKey: "V6_expl",
  sriCode: null, normCode: "VENT_HRICE_CTRL",
  applicableFor: ["ISO52120"], 
  levels: [
    { level: 0, labelKey: "V60", normClass: "D", sriScores: null },
    { level: 1, labelKey: "V61", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const V7 = {
  id: "V7", domain: "ventilation", titleKey: "V7", exprKey: "V7_expl",
  sriCode: "V-2c", normCode: "VENT_HRHEAT_CTRL",
  applicableFor: ["SRI", "ISO52120", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "V70", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V71", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "V72", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 2, health: 2, maintenance: 0, information: 0 } }
  ],
  // GRO-calc indique ce service en "Optional" mais sans seuil renseigné : exclu du calcul GRO
  bacs: { level: 1 }
};

export const V8 = {
  id: "V8", domain: "ventilation", titleKey: "V8", exprKey: null,
  sriCode: "V-3", normCode: "VENT_FREECOOL_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO"], triage: false,
  levels: [
    { level: 0, labelKey: "V80", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V81", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 3, convenience: 2, health: 1, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "V82", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 3, convenience: 2, health: 1, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "V83", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 3, convenience: 2, health: 1, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const V9 = {
  id: "V9", domain: "ventilation", titleKey: "V9", exprKey: "V9_expl",
  sriCode: "V-2d", normCode: "VENT_AHUSAT_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "V90", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V91", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "V92", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "V93", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 1, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const V_10 = {
  id: "V_10", domain: "ventilation", titleKey: "V_10", exprKey: "V10_expl",
  sriCode: null, normCode: "VENT_HUM_CTRL",
  applicableFor: ["ISO52120", "DIN"], 
  levels: [
    { level: 0, labelKey: "V100", normClass: "D", sriScores: null },
    { level: 1, labelKey: "V101", normClass: "C", sriScores: null },
    { level: 2, labelKey: "V102", normClass: "A", sriScores: null }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const V_11 = {
  id: "V_11", domain: "ventilation", titleKey: "V_11", exprKey: "V11_expl",
  sriCode: "V-6", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: true,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "V110", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "V111", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 2, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "V112", normClass: "B", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 3, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "V113", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 3, maintenance: 2, information: 3 } }
  ],
  gro: { basic: [{ level: 1 }], optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const ventilationServices = [V1, V2, V3, V4, V5, V6, V7, V8, V9, V_10, V_11];

export default ventilationServices;
