/**
 * dhw.js
 * -----------------------------------------------------------------------
 * Domain: Domestic hot water distribution control (DHW)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "DHW", "GRO-calc", "BACS-3R"
 * -----------------------------------------------------------------------
 */

export const DHW1 = {
  id: "DHW1", domain: "dhw", titleKey: "DHW1", exprKey: null,
  sriCode: "DHW-1a", normCode: "DHW-_STRG_CTRL_EL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "DHW10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DHW11", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DHW12", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DHW13", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] },
  bacs: { level: 1 }
};

export const DHW2 = {
  id: "DHW2", domain: "dhw", titleKey: "DHW2", exprKey: null,
  sriCode: "DHW-1b", normCode: "DHW-_STRG_CTRL_HG",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "DHW20", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DHW21", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DHW22", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DHW23", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 3, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] },
  bacs: { level: 1 }
};

export const DHW3 = {
  id: "DHW3", domain: "dhw", titleKey: "DHW3", exprKey: null,
  sriCode: "DHW-1d", normCode: "DHW-_STRG_CTRL_SOL",
  applicableFor: ["SRI", "ISO52120", "GRO"], triage: false,
  levels: [
    { level: 0, labelKey: "DHW30", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DHW31", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DHW32", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DHW33", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const DHW4 = {
  id: "DHW4", domain: "dhw", titleKey: "DHW4", exprKey: null,
  sriCode: null, normCode: "DHW-_CIRC_CTRL",
  applicableFor: ["ISO52120", "BACS", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "DHW40", normClass: "D", sriScores: null },
    { level: 1, labelKey: "DHW41", normClass: "A", sriScores: null }
  ],
  // Non repris dans l'onglet GRO-calc (pas de seuil basic/optional)
  bacs: { level: 1 }
};

export const DHW5 = {
  id: "DHW5", domain: "dhw", titleKey: "DHW5", exprKey: null,
  sriCode: "DHW-2b", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "DHW50", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DHW51", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DHW52", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DHW53", normClass: null, sriScores: { energyEfficiency: 3, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "DHW54", normClass: null, sriScores: { energyEfficiency: 3, flexibility: 3, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 2 }] },
  bacs: { level: 2 }
};

export const DHW6 = {
  id: "DHW6", domain: "dhw", titleKey: "DHW6", exprKey: "DHW6_expl",
  sriCode: "DHW-3", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO"], triage: true,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "DHW60", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DHW61", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "DHW62", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "DHW63", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "DHW64", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 2, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const dhwServices = [DHW1, DHW2, DHW3, DHW4, DHW5, DHW6];

export default dhwServices;
