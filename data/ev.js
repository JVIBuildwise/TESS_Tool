/**
 * ev.js
 * -----------------------------------------------------------------------
 * Domain: Electric vehicle charging control (EV)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "EV", "GRO-calc", "BACS-3R"
 *
 * NOTE : aucun des 3 services EV n'est repris dans la norme ISO 52120-1
 * (colonne "Functionality level to reach (norm)" vide dans l'onglet
 * "Summary"), ni dans le GRO (absents de "GRO-calc"), ni dans la méthode
 * BACS (marqués "x" dans "BACS-3R"). Ils ne sont donc applicables qu'au SRI.
 * -----------------------------------------------------------------------
 */

export const EV1 = {
  id: "EV1", domain: "ev", titleKey: "EV1", exprKey: "EV1_expl",
  sriCode: "EV-15", normCode: null,
  applicableFor: ["SRI"], triage: false,
  levels: [
    { level: 0, labelKey: "EV10", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "EV11", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "EV12", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "EV13", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 3, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "EV14", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 3, health: 0, maintenance: 0, information: 0 } }
  ]
};

export const EV2 = {
  id: "EV2", domain: "ev", titleKey: "EV2", exprKey: "EV2_expl",
  sriCode: "EV-16", normCode: null,
  applicableFor: ["SRI"], triage: false,
  levels: [
    { level: 0, labelKey: "EV20", normClass: null, sriScores: { energyEfficiency: 0, flexibility: -2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "EV21", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "EV22", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 3, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ]
};

export const EV3 = {
  id: "EV3", domain: "ev", titleKey: "EV3", exprKey: "EV3_expl",
  sriCode: "EV-17", normCode: null,
  applicableFor: ["SRI"], triage: false,
  levels: [
    { level: 0, labelKey: "EV30", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "EV31", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 2 } },
    { level: 2, labelKey: "EV32", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 3 } }
  ]
};

export const evServices = [EV1, EV2, EV3];

export default evServices;
