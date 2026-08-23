/**
 * worldEngine.ts — Centralized Virtual World / Realm Progression Engine.
 *
 * Implements:
 *  - Calculates unlocked areas based on student Level and XP
 *  - Integrates play-style-specific world themes and unlockable elements
 *  - Computes progress toward the next realm milestone & world element unlock
 */
import type { RealmArea, WorldProgression, PlayStyle } from "../../types";
import { getPlayStyleWorldConfig } from "./playStyleWorldConfig";

export const REALM_AREAS_CONFIG: Omit<RealmArea, "unlocked">[] = [
  {
    id: "restful-hollow",
    name: "Restful Hollow",
    icon: "🌙",
    unlockLevel: 1,
    unlockXp: 0,
    title: "Sanctuary of Rest & Morning Dawn",
    description: "A tranquil meadow clearing bathed in gentle dawn mist and glowing fireflies.",
    lore: "Where every explorer begins. A sanctuary for quiet sleep, hydration, and restoring calm rhythm.",
    atmosphere: "Peaceful dawn mist, glowing fireflies, soft moss.",
    color: "primary",
  },
  {
    id: "trail-ridge",
    name: "Trail Ridge",
    icon: "⛰️",
    unlockLevel: 3,
    unlockXp: 250,
    title: "Alpine Foothills of Energy & Movement",
    description: "Sun-drenched alpine foothills with winding stone pathways and energizing mountain air.",
    lore: "Carved by daily movement and active exploration. The air is crisp and full of vitality.",
    atmosphere: "Alpine wildflowers, winding stone steps, morning breeze.",
    color: "sky",
  },
  {
    id: "focus-grove",
    name: "Focus Grove",
    icon: "🌿",
    unlockLevel: 5,
    unlockXp: 450,
    title: "Ancient Grove of Reflection & Clarity",
    description: "An ancient grove of glowing willow trees framing a crystal clear reflection pool.",
    lore: "Formed by mindful focus and digital balance. The quiet waters reflect your inner clarity.",
    atmosphere: "Luminescent willow lanterns, tranquil ripples, mindful stillness.",
    color: "mint",
  },
  {
    id: "sun-arena",
    name: "Sun Arena",
    icon: "☀️",
    unlockLevel: 8,
    unlockXp: 1000,
    title: "Radiant Sanctuary of Flourishing Vitality",
    description: "A grand radiant plateau where celestial solar petals bloom in celebration of your vitality.",
    lore: "The crowning peak of your flourishing wellbeing journey, illuminated by continuous personal growth.",
    atmosphere: "Golden sunlight, radiant solar blooms, celestial warmth.",
    color: "amber",
  },
];

/**
 * Pure calculation function for complete world progression.
 */
export function calculateWorldProgression(
  level: number,
  totalXp: number,
  realmEnergy: number = 0,
  playStyle: PlayStyle = "casual-player",
): WorldProgression {
  const worldConfig = getPlayStyleWorldConfig(playStyle, realmEnergy, level);

  const areas: RealmArea[] = REALM_AREAS_CONFIG.map((cfg) => ({
    ...cfg,
    unlocked: level >= cfg.unlockLevel,
  }));

  const unlockedAreas = areas.filter((a) => a.unlocked);
  const lockedAreas = areas.filter((a) => !a.unlocked);

  const currentArea = unlockedAreas[unlockedAreas.length - 1] || areas[0];
  const nextArea = lockedAreas.length > 0 ? lockedAreas[0] : null;

  let xpToNextArea = 0;
  let progressToNextAreaPct = 100;

  if (nextArea) {
    const prevAreaXp = currentArea.unlockXp;
    const nextAreaXp = nextArea.unlockXp;
    const span = Math.max(1, nextAreaXp - prevAreaXp);
    const progressInSpan = Math.max(0, Math.min(span, totalXp - prevAreaXp));

    xpToNextArea = Math.max(0, nextAreaXp - totalXp);
    progressToNextAreaPct = Math.round((progressInSpan / span) * 100);
  }

  // Next World Element calculation
  const unlockedElements = worldConfig.elements.filter((el) => el.unlocked);
  const lockedElements = worldConfig.elements.filter((el) => !el.unlocked);

  const nextElement = lockedElements.length > 0 ? lockedElements[0] : null;
  let energyToNextElement = 0;
  let progressToNextElementPct = 100;

  if (nextElement) {
    const lastUnlockedEnergy = unlockedElements.length > 0 ? unlockedElements[unlockedElements.length - 1].requiredEnergy : 0;
    const targetEnergy = nextElement.requiredEnergy;
    const energySpan = Math.max(1, targetEnergy - lastUnlockedEnergy);
    const currentProgressInSpan = Math.max(0, Math.min(energySpan, realmEnergy - lastUnlockedEnergy));

    energyToNextElement = Math.max(0, targetEnergy - realmEnergy);
    progressToNextElementPct = Math.round((currentProgressInSpan / energySpan) * 100);
  }

  return {
    currentRealmName: worldConfig.regionName,
    unlockedAreasCount: unlockedAreas.length,
    totalAreasCount: areas.length,
    currentArea,
    nextArea,
    xpToNextArea,
    progressToNextAreaPct,
    vitalityXp: totalXp,
    realmEnergy,
    nextElement,
    energyToNextElement,
    progressToNextElementPct,
    elements: worldConfig.elements,
    areas,
  };
}
