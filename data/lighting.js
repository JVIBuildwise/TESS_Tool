/**
 * lighting.js
 * -----------------------------------------------------------------------
 * Domain: Lighting control (L)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "L", "GRO-calc", "BACS-3R"
 * -----------------------------------------------------------------------
 */

export const L1 = {
  id: "L1", domain: "lighting", titleKey: "L1", exprKey: null,
  sriCode: "L-1a", normCode: "LIGHT_OCC_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "L10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "L11", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "L12", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 2, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "L13", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const L2 = {
  id: "L2", domain: "lighting", titleKey: "L2", exprKey: null,
  sriCode: "L-2", normCode: "LIGHT_LEVEL_CTRL",
  applicableFor: ["SRI", "ISO52120", "GRO", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "L20", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "L21", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "L22", normClass: "B", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 1, convenience: 1, health: 1, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "L23", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 2, convenience: 2, health: 2, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "L24", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 3, convenience: 3, health: 3, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const lightingServices = [L1, L2];

export default lightingServices;
