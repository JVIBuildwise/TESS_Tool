/**
 * electricity.js
 * -----------------------------------------------------------------------
 * Domain: Control of electricity consumption and production (E)
 * Source: TOOL_ISO52120+SRI_leeg_v0.5_inprogress.xlsm — onglets "E", "BACS-3R"
 *
 * Champ `bacs` : { level } = niveau de fonctionnalité minimal à atteindre
 * pour ce service selon la méthode BACS (onglet BACS-3R). Absent si le
 * service n'est pas repris dans la méthode BACS (colonne "BACS included" = x).
 * -----------------------------------------------------------------------
 */

export const E1 = {
  id: "E1", domain: "electricity", titleKey: "E1", exprKey: "E1_expl",
  sriCode: "E-2", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "E10", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E11", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "E12", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "E13", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "E14", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 2, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 2 }
};

export const E2 = {
  id: "E2", domain: "electricity", titleKey: "E2", exprKey: "E2_expl",
  sriCode: "E-3", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO"], triage: false,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "E20", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E21", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "E22", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "E23", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 4, labelKey: "E24", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 3, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 3 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const E3 = {
  id: "E3", domain: "electricity", titleKey: "E3", exprKey: "E3_expl",
  sriCode: "E-4", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: false,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "E30", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E31", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "E32", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "E33", normClass: "A", sriScores: { energyEfficiency: 0, flexibility: 3, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { basic: [{ level: 1 }], optional: [{ level: 2 }] },
  // Niveau BACS requis = 0 : ce service est considéré conforme dès qu'un
  // niveau est renseigné (même "Aucun"), tant qu'il n'est pas marqué N/A.
  bacs: { level: 0 }
};

export const E4 = {
  id: "E4", domain: "electricity", titleKey: "E4", exprKey: "E4_expl",
  sriCode: "E-5", normCode: null,
  applicableFor: ["SRI", "ISO52120"], triage: false,
  scoreIn: "mc", 
  levels: [
    { level: 0, labelKey: "E40", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E41", normClass: "A", sriScores: { energyEfficiency: 1, flexibility: 1, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "E42", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 2, comfort: 0, convenience: 1, health: 0, maintenance: 0, information: 0 } }
  ]
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const E5 = {
  id: "E5", domain: "electricity", titleKey: "E5", exprKey: "E5_expl",
  sriCode: "E-8", normCode: null,
  applicableFor: ["SRI", "GRO"], triage: false,
  scoreIn: "mc", // pour la norme
  levels: [
    { level: 0, labelKey: "E50", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E51", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 2, labelKey: "E52", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 2, comfort: 0, convenience: 2, health: 0, maintenance: 0, information: 0 } },
    { level: 3, labelKey: "E53", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 3, comfort: 0, convenience: 3, health: 0, maintenance: 0, information: 0 } }
  ],
  gro: { optional: [{ level: 1 }] }
  // Non repris dans la méthode BACS (BACS-3R : "x")
};

export const E6 = {
  id: "E6", domain: "electricity", titleKey: "E6", exprKey: "E6_expl",
  sriCode: "E-11", normCode: null,
  applicableFor: ["SRI", "GRO", "BACS"], triage: false,
  levels: [
    { level: 0, labelKey: "E60", normClass: null, sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E61", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 1 } },
    { level: 2, labelKey: "E62", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 2 } },
    { level: 3, labelKey: "E63", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "E64", normClass: null, sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 2, information: 3 } }
  ],
  gro: { optional: [{ level: 4 }] },
  bacs: { level: 2 }
};

export const E7 = {
  id: "E7", domain: "electricity", titleKey: "E7", exprKey: "E7_expl",
  sriCode: "E-12", normCode: null,
  applicableFor: ["SRI", "ISO52120", "GRO", "BACS"], triage: true,
  levels: [
    { level: 0, labelKey: "E70", normClass: "D", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 0 } },
    { level: 1, labelKey: "E71", normClass: "C", sriScores: { energyEfficiency: 0, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 1 } },
    { level: 2, labelKey: "E72", normClass: "B", sriScores: { energyEfficiency: 1, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 0, information: 2 } },
    { level: 3, labelKey: "E73", normClass: "A", sriScores: { energyEfficiency: 2, flexibility: 0, comfort: 0, convenience: 0, health: 0, maintenance: 1, information: 3 } },
    { level: 4, labelKey: "E74", normClass: "A", sriScores: { energyEfficiency: 3, flexibility: 0, comfort: 0, convenience: 1, health: 0, maintenance: 2, information: 3 } }
  ],
  gro: { basic: [{ level: 3 }], optional: [{ level: 4 }] },
  bacs: { level: 2 }
};

export const electricityServices = [E1, E2, E3, E4, E5, E6, E7];

export default electricityServices;
