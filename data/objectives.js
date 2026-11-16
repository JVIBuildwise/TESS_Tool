/**
 * objectives.js
 * -----------------------------------------------------------------------
 * Les méthodes de calcul proposées sur la page d'accueil.
 * `id` est un code technique STABLE (indépendant de la langue/libellé
 * affiché), utilisé dans state.selectedObjectives et dans `applicableFor`
 * de chaque service.
 *
 * TEMPORAIRE : seules les méthodes ISO 52120-1 et SRI sont actives.
 * Les méthodes BACS et GRO sont commentées ci-dessous (le code de calcul
 * et d'affichage correspondant dans app.js reste intact mais inactif).
 * Pour les réactiver : décommenter les lignes BACS / GRO.
 * -----------------------------------------------------------------------
 */
export const objectives = [
  // TEMPORAIRE - BACS désactivé :
  // { id: "BACS", icon: "🏢", titleKey: "OBJ_BACS_TITLE", descKey: "OBJ_BACS_DESC", accent: "#b3261e" },
  { id: "ISO52120", icon: "📐", titleKey: "OBJ_ISO_TITLE", descKey: "OBJ_ISO_DESC", accent: "#0087b7" },
  { id: "SRI", icon: "🧠", titleKey: "OBJ_SRI_TITLE", descKey: "OBJ_SRI_DESC", accent: "#7a3ec2" }
  // TEMPORAIRE - GRO désactivé :
  // ,{ id: "GRO", icon: "🏷️", titleKey: "OBJ_GRO_TITLE", descKey: "OBJ_GRO_DESC", accent: "#1a7f37" }
];

export default objectives;
