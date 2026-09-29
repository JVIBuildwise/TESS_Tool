/**
 * de.js
 * -----------------------------------------------------------------------
 * Domain: Blind control / Dynamic building envelope (DE)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "DE", "GRO-calc", "BACS-3R"
 * -----------------------------------------------------------------------
 */

export const DE1 = {
  id: "DE1", domain: "de", titleKey: "DE1", exprKey: "DE1_expl",
  sriCode: "DE-1", normCode: "BLIND_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "DIN"], triage: false,
  levels: [
    { level: 0, labelKey: "DE10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DE11", normClass: "D", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DE12", normClass: "C", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 1, convenience: 2, health: 1, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DE13", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 3, health: 2, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "DE14", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 3, convenience: 3, health: 3, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 4 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const DE2 = {
  id: "DE2", domain: "de", titleKey: "DE2", exprKey: null,
  sriCode: "DE-2", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "DE20", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DE21", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "DE22", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "DE23", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 2, health: 1, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const DE3 = {
  id: "DE3", domain: "de", titleKey: "DE3", exprKey: "DE3_expl",
  sriCode: "DE-4", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: false,
  levels: [
    { level: 0, labelKey: "DE30", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "DE31", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "DE32", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "DE33", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "DE34", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 2, information: 3 } }
  ],
  gro: { optional: [{ level: 4 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const deServices = [DE1, DE2, DE3];

export default deServices;
