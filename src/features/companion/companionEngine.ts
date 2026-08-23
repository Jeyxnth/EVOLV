/**
 * companionEngine.ts — Centralized Virtual Companion progression & state engine.
 *
 * Grounded in EVOLV's core principle:
 * "When you take care of yourself, your companion and world grow with you."
 */
import type {
  CompanionData,
  CompanionStage,
  CompanionState,
  PlayStyle,
} from "../../types";

/**
 * Calculates the companion's developmental stage from the student's level & total XP.
 */
export function calculateCompanionStage(level: number, totalXp: number): CompanionStage {
  if (level >= 6 || totalXp >= 700) {
    return "flourishing";
  }
  if (level >= 3 || totalXp >= 250) {
    return "budding";
  }
  return "seedling";
}

/**
 * Stage descriptive metadata.
 */
export const COMPANION_STAGE_INFO: Record<
  CompanionStage,
  { title: string; description: string; auraColor: string }
> = {
  seedling: {
    title: "Seedling Spark",
    description: "A gentle glowing wisp taking its first curious steps alongside your wellbeing journey.",
    auraColor: "var(--color-evolv-primary-soft)",
  },
  budding: {
    title: "Budding Sprout",
    description: "Growing stronger with every healthy habit, crowned with a vibrant leaf of vitality.",
    auraColor: "var(--color-evolv-mint-soft)",
  },
  flourishing: {
    title: "Flourishing Luminary",
    description: "Radiating vibrant energy and celestial petals, celebrating your continuous personal growth.",
    auraColor: "var(--color-evolv-sky-soft)",
  },
};

/**
 * Returns complete CompanionData derived from player progress.
 */
export function getCompanionData(
  level: number,
  totalXp: number,
  state: CompanionState = "idle",
  customName: string = "Lumi",
): CompanionData {
  const stage = calculateCompanionStage(level, totalXp);
  const info = COMPANION_STAGE_INFO[stage];

  return {
    name: customName,
    stage,
    state,
    level,
    stageTitle: info.title,
    stageDescription: info.description,
    auraColor: info.auraColor,
  };
}

export interface CompanionContext {
  completedMissionsToday: number;
  currentStreak: number;
  playStyle: PlayStyle;
}

/**
 * Generates an encouraging, therapeutic dialogue line based on student's current state.
 */
export function getCompanionEncouragement(
  companion: CompanionData,
  context: CompanionContext,
): string {
  const { completedMissionsToday, currentStreak, playStyle } = context;

  // 1. Flourishing or high-stage encouragement
  if (companion.stage === "flourishing" && completedMissionsToday >= 3) {
    return `${companion.name} is glowing brightly! Your realm is fully flourishing today ✨`;
  }

  // 2. Completion milestone lines
  if (completedMissionsToday >= 3) {
    return "You've completed all missions today! Your light is shining bright ✨";
  }
  if (completedMissionsToday > 0) {
    return `${completedMissionsToday} mission${completedMissionsToday > 1 ? "s" : ""} done today! Every step counts 🌱`;
  }

  // 2. Streak acknowledgment
  if (currentStreak >= 3) {
    return `${currentStreak} days of steady momentum! Let's take it one step at a time today 🔥`;
  }

  // 3. Play-style adapted gentle greetings
  switch (playStyle) {
    case "puzzle-explorer":
      return "Every small habit uncovers another piece of your world 🧩";
    case "quiz-master":
      return "Curiosity and consistency are your greatest powers 📚";
    case "competitor":
      return "Ready for today's milestone? You've got this 🏆";
    case "explorer-builder":
      return "Your actions are expanding our sanctuary today 🌍";
    case "casual-player":
    default:
      return "Take your time today — I'm right here with you 🌿";
  }
}
