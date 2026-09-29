/**
 * sriWeights.js
 * -----------------------------------------------------------------------
 * Table de pondération officielle de la méthode SRI (Smart Readiness
 * Indicator) pour la région "Europe de l'Ouest", déclinée par type de
 * bâtiment (Résidentiel / Non résidentiel).
 *
 * SRI_DOMAIN_WEIGHTS[buildingType][domainKey][criterionKey] = poids du
 * domaine technique dans le critère SRI donné. Pour un critère donné
 * (colonne), la somme des poids de tous les domaines vaut 1.
 *
 * SRI_CRITERIA_WEIGHTS[criterionKey] = poids du critère dans le score SRI
 * global. La somme des 7 poids vaut 1.
 *
 * SRI_KF_GROUPS : regroupement des 7 critères SRI en 3 "Key Functionalities"
 * (fonctionnalités clés) :
 *   - KF1 (bâtiment)   : Energy efficiency + Maintenance & fault prediction
 *   - KF2 (utilisateur): Comfort + Convenience + Health/wellbeing + Information
 *   - KF3 (réseau)     : Energy flexibility and storage
 *
 * Les clés de domaine (heating, dhw, cooling, ventilation, lighting,
 * electricity, de, ev, mc) correspondent exactement aux clés utilisées dans
 * data/index.js. Les clés de critère (energyEfficiency, flexibility,
 * comfort, convenience, health, maintenance, information) correspondent
 * exactement aux clés utilisées dans les champs `sriScores` de chaque
 * niveau de service (heating.js, dhw.js, etc.) et dans GRO_CRITERIA
 * (app.js).
 * -----------------------------------------------------------------------
 */

// Poids des 7 critères SRI dans le score global (Europe de l'Ouest).
export const SRI_CRITERIA_WEIGHTS = {
  energyEfficiency: 0.16666667,
  flexibility: 0.33333333,
  comfort: 0.08333333,
  convenience: 0.08333333,
  health: 0.08333333,
  maintenance: 0.16666667,
  information: 0.08333333
};

// Poids de chaque domaine technique dans chaque critère SRI, par type de
// bâtiment (RES = Résidentiel, NRES = Non résidentiel). Europe de l'Ouest.
export const SRI_DOMAIN_WEIGHTS = {
  RES: {
    heating: {
      energyEfficiency: 0.339668015186256,
      flexibility: 0.457215993005328,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.34643472948636,
      information: 0.114285714285714
    },
    dhw: {
      energyEfficiency: 0.0762104400386001,
      flexibility: 0.102584377868239,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0.0777286703439871,
      information: 0.114285714285714
    },
    cooling: {
      energyEfficiency: 0.0303893122300324,
      flexibility: 0.0409060581120194,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.0309947145182771,
      information: 0.114285714285714
    },
    ventilation: {
      energyEfficiency: 0.178171975395353,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.181721437811249,
      information: 0.114285714285714
    },
    lighting: {
      energyEfficiency: 0.0146493272559673,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0,
      information: 0
    },
    electricity: {
      energyEfficiency: 0.110910929893791,
      flexibility: 0.149293571014414,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0.113120447840127,
      information: 0.114285714285714
    },
    de: {
      energyEfficiency: 0.05,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.05,
      information: 0.114285714285714
    },
    ev: {
      energyEfficiency: 0,
      flexibility: 0.05,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0,
      information: 0.114285714285714
    },
    mc: {
      energyEfficiency: 0.2,
      flexibility: 0.2,
      comfort: 0.2,
      convenience: 0.2,
      health: 0.2,
      maintenance: 0.2,
      information: 0.2
    }
  },
  NRES: {
    heating: {
      energyEfficiency: 0.272780872338696,
      flexibility: 0.40662223154885,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.316587776494549,
      information: 0.114285714285714
    },
    dhw: {
      energyEfficiency: 0.0825849793535045,
      flexibility: 0.123105730651973,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0.0958476111657529,
      information: 0.114285714285714
    },
    cooling: {
      energyEfficiency: 0.126701525794181,
      flexibility: 0.188868290937589,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.147048999388204,
      information: 0.114285714285714
    },
    ventilation: {
      energyEfficiency: 0.143086498291582,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.166065296118994,
      information: 0.114285714285714
    },
    lighting: {
      energyEfficiency: 0.103779048201677,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0,
      information: 0
    },
    electricity: {
      energyEfficiency: 0.0210670760203591,
      flexibility: 0.0314037468615883,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0.0244503168325009,
      information: 0.114285714285714
    },
    de: {
      energyEfficiency: 0.05,
      flexibility: 0,
      comfort: 0.16,
      convenience: 0.1,
      health: 0.16,
      maintenance: 0.05,
      information: 0.114285714285714
    },
    ev: {
      energyEfficiency: 0,
      flexibility: 0.05,
      comfort: 0,
      convenience: 0.1,
      health: 0,
      maintenance: 0,
      information: 0.114285714285714
    },
    mc: {
      energyEfficiency: 0.2,
      flexibility: 0.2,
      comfort: 0.2,
      convenience: 0.2,
      health: 0.2,
      maintenance: 0.2,
      information: 0.2
    }
  }
};

// Regroupement des 7 critères SRI en 3 "Key Functionalities" (KF1/KF2/KF3).
export const SRI_KF_GROUPS = {
  KF1: ["energyEfficiency", "maintenance"],
  KF2: ["comfort", "convenience", "health", "information"],
  KF3: ["flexibility"]
};

export default SRI_DOMAIN_WEIGHTS;
