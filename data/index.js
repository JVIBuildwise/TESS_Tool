/**
 * index.js
 * -----------------------------------------------------------------------
 * Agrège tous les domaines de services disponibles.
 * -----------------------------------------------------------------------
 */

import { heatingServices } from "./heating.js";
import { dhwServices } from "./dhw.js";
import { coolingServices } from "./cooling.js";
import { ventilationServices } from "./ventilation.js";
import { lightingServices } from "./lighting.js";
import { electricityServices } from "./electricity.js";
import { deServices } from "./de.js";
import { evServices } from "./ev.js";
import { mcServices } from "./mc.js";

export const domains = [
  { key: "heating", titleKey: "H_TITEL", icon: "🔥", services: heatingServices },
  { key: "dhw", titleKey: "DHW_TITEL", icon: "🚿", services: dhwServices },
  { key: "cooling", titleKey: "C_TITEL", icon: "❄️", services: coolingServices },
  { key: "ventilation", titleKey: "V_TITEL", icon: "🌀", services: ventilationServices },
  { key: "lighting", titleKey: "L_TITEL", icon: "💡", services: lightingServices },
  { key: "electricity", titleKey: "E_TITEL", icon: "🔌", services: electricityServices },
  { key: "de", titleKey: "DE_TITEL", icon: "🪟", services: deServices },
  { key: "ev", titleKey: "EV_TITEL", icon: "🚗", services: evServices },
  { key: "mc", titleKey: "MC_TITEL", icon: "📊", services: mcServices }
];

export const allServices = domains.flatMap((d) => d.services);

export default domains;
