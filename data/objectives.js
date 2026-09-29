/**
 * objectives.js
 * -----------------------------------------------------------------------
 * Les 4 méthodes de calcul proposées sur la page d'accueil.
 * `id` est un code technique STABLE (indépendant de la langue/libellé
 * affiché), utilisé dans state.selectedObjectives et dans `applicableFor`
 * de chaque service.
 * -----------------------------------------------------------------------
 */

export const objectives = [
  { id: "BACS", icon: "🏢", titleKey: "OBJ_BACS_TITLE", descKey: "OBJ_BACS_DESC", accent: "#b3261e" }, 
  { id: "ISO52120", icon: "📐", titleKey: "OBJ_ISO_TITLE", descKey: "OBJ_ISO_DESC", accent: "#0087b7" },
  { id: "SRI", icon: "🧠", titleKey: "OBJ_SRI_TITLE", descKey: "OBJ_SRI_DESC", accent: "#7a3ec2" },
  { id: "GRO", icon: "🏷️", titleKey: "OBJ_GRO_TITLE", descKey: "OBJ_GRO_DESC", accent: "#1a7f37" }
];

export default objectives;
