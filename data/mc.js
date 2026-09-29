/**
 * mc.js
 * -----------------------------------------------------------------------
 * Domain: Monitoring and control (MC)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "MC", "GRO-calc", "BACS-3R"
 *
 * ⚠️ ASSOMPTION À VALIDER : pour MC7, niveau 1 ("DSM control without the
 * possibility to override..."), l'onglet source ne fournit que 6 valeurs
 * de score SRI au lieu de 7 (une valeur semble manquante entre "health"
 * et "information"). J'ai complété le score "information" à 0 par défaut.
 * À vérifier/corriger avec toi si tu as la valeur exacte.
 * -----------------------------------------------------------------------
 */

export const MC0 = {
  id: "MC0", domain: "mc", titleKey: "MC0", exprKey: "MC0_expl",
  sriCode: null, normCode: "BMS_SP",
  applicableFor: ["ISO52120", "BACS", "DIN"],
  levels: [
    { level: 0, labelKey: "MC00", normClass: "D", sriScores: null },
    { level: 1, labelKey: "MC01", normClass: "C", sriScores: null },
    { level: 2, labelKey: "MC02", normClass: "B", sriScores: null },
    { level: 3, labelKey: "MC03", normClass: "A", sriScores: null }
  ],
  // Non repris dans l'onglet GRO-calc
  bacs: { level: 2 }
};

export const MC1 = {
  id: "MC1", domain: "mc", titleKey: "MC1", exprKey: "MC1_expl",
  sriCode: "MC-3", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "MC10", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC11", normClass: "C", sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 1, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "MC12", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 1, comfort: 2, convenience: 2, health: 1, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "MC13", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 2, comfort: 2, convenience: 3, health: 1, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }], optional: [{ level: 3 }] },
  bacs: { level: 1 }
};

export const MC2 = {
  id: "MC2", domain: "mc", titleKey: "MC2", exprKey: "MC2_expl",
  sriCode: "MC-4", normCode: "BMS_FD",
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: true,
  levels: [
    { level: 0, labelKey: "MC20", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC21", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 1, health: 1, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "MC22", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 2, health: 2, maintenance: 2, information: 2 } },
    { level: 3, labelKey: "MC23", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 3, health: 3, maintenance: 3, information: 3 } }
  ],
  gro: { basic: [{ level: 2 }], optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const MC3 = {
  id: "MC3", domain: "mc", titleKey: "MC3", exprKey: "MC3_expl",
  sriCode: "MC-9", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "MC30", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC31", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 1, information: 0 } },
    { level: 2, labelKey: "MC32", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 1, convenience: 1, health: 0, maintenance: 2, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const MC4 = {
  id: "MC4", domain: "mc", titleKey: "MC4", exprKey: "MC4_expl",
  sriCode: "MC-13", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS"], triage: true,
  levels: [
    { level: 0, labelKey: "MC40", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC41", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "MC42", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 2, health: 0, maintenance: 2, information: 2 } },
    { level: 3, labelKey: "MC43", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 3, health: 0, maintenance: 3, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }] },
  bacs: { level: 1 }
};

export const MC5 = {
  id: "MC5", domain: "mc", titleKey: "MC5", exprKey: "MC5_expl",
  sriCode: "MC-25", normCode: "BMS_SG",
  applicableFor: ["SRI", "ISO52120", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "MC50", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC51", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "MC52", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 3, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 1 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const MC6 = {
  id: "MC6", domain: "mc", titleKey: "MC6", exprKey: "MC6_expl",
  sriCode: "MC-28", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: true,
  levels: [
    { level: 0, labelKey: "MC60", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC61", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 2 } },
    { level: 2, labelKey: "MC62", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } }
  ],
  gro: { optional: [{ level: 2 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const MC7 = {
  id: "MC7", domain: "mc", titleKey: "MC7", exprKey: "MC7_expl",
  sriCode: "MC-29", normCode: null,
  applicableFor: ["SRI"], triage: true,
  levels: [
    { level: 0, labelKey: "MC70", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC71", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 3, comfort: -2, convenience: 0, health: 0, maintenance: -1, information: -2 } },
    { level: 2, labelKey: "MC72", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "MC73", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 2, health: 0, maintenance: 1, information: 0 } },
    { level: 4, labelKey: "MC74", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 3, health: 0, maintenance: 1, information: 0 } }
  ]
  // Non repris dans l'onglet GRO-calc, non repris dans la méthode BACS (BACS-3R : "x")
};

export const MC8 = {
  id: "MC8", domain: "mc", titleKey: "MC8", exprKey: "MC8_expl",
  sriCode: "MC-30", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS", "DIN"], triage: true,
  levels: [
    { level: 0, labelKey: "MC80", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "MC81", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 1, information: 0 } },
    { level: 2, labelKey: "MC82", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 2, health: 0, maintenance: 1, information: 0 } },
    { level: 3, labelKey: "MC83", normClass: null, sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 3, health: 0, maintenance: 1, information: 0 } }
  ],
  gro: { basic: [{ level: 2 }], optional: [{ level: 3 }] },
  bacs: { level: 2 }
};

export const MC9 = {
  id: "MC9", domain: "mc", titleKey: "MC9", exprKey: "MC9_expl",
  sriCode: null, normCode: null,
  applicableFor: ["ISO52120"], 
  levels: [
    { level: 0, labelKey: "MC90", normClass: "D", sriScores: null },
    { level: 1, labelKey: "MC91", normClass: "A", sriScores: null }
  ]
  // Non repris dans l'onglet GRO-calc, non repris dans la méthode BACS (BACS-3R : "x")
};

export const mcServices = [MC0, MC1, MC2, MC3, MC4, MC5, MC6, MC7, MC8, MC9];

export default mcServices;
