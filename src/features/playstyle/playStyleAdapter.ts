/**
 * playStyleAdapter.ts - Centralized Play-Style Adaptation Layer for EVOLV.
 *
 * Core Principle:
 * The underlying health/wellbeing mission is NEVER changed.
 * Only the framing, presentation title, microcopy, visual accents,
 * and lightweight post-completion interactions adapt to the student's play style.
 */
import type { PlayStyle, Mission } from "../../types";

export interface PlayStyleConfig {
  value: PlayStyle;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  colorName: "primary" | "sky" | "mint" | "amber" | "peach";
  cardBg: string;
  accentBorder: string;
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  completionActionLabel: string;
}

export interface QuizInteraction {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PuzzleInteraction {
  type: "puzzle";
  clueTitle: string;
  clueText: string;
  fragmentIcon: string;
}

export interface CasualInteraction {
  type: "casual";
  affirmation: string;
  reflectionPrompt: string;
}

export interface CompetitorInteraction {
  type: "competitor";
  metricLabel: string;
  personalRecordNote: string;
  nextMilestone: string;
}

export interface BuilderInteraction {
  type: "builder";
  worldArea: string;
  contributionNote: string;
  energyPoints: number;
}

export type PlayStyleInteraction =
  | QuizInteraction
  | PuzzleInteraction
  | CasualInteraction
  | CompetitorInteraction
  | BuilderInteraction;

export interface AdaptedMission extends Mission {
  presentationTitle: string;
  presentationDescription: string;
  framingTag: string;
  completionFeedback: string;
  interaction?: PlayStyleInteraction;
}

export const PLAY_STYLE_CONFIGS: Record<PlayStyle, PlayStyleConfig> = {
  "puzzle-explorer": {
    value: "puzzle-explorer",
    label: "Puzzle Explorer",
    emoji: "🧩",
    tagline: "Discover & Uncover",
    description: "Your missions act as clues that reveal pieces of your weekly wellbeing puzzle.",
    colorName: "primary",
    cardBg: "var(--color-evolv-primary-soft)",
    accentBorder: "var(--color-evolv-primary)",
    homeBannerTitle: "Mystery of the Week",
    homeBannerSubtitle: "Complete daily clues to uncover your secret wellbeing pattern.",
    completionActionLabel: "Uncover Clue",
  },
  "quiz-master": {
    value: "quiz-master",
    label: "Quiz Master",
    emoji: "📚",
    tagline: "Learn & Earn",
    description: "Every mission offers quick insights and optional habit knowledge checks.",
    colorName: "sky",
    cardBg: "var(--color-evolv-sky-soft)",
    accentBorder: "var(--color-evolv-sky)",
    homeBannerTitle: "Knowledge In Motion",
    homeBannerSubtitle: "Learn the science behind small daily habits as you complete them.",
    completionActionLabel: "Quick Check",
  },
  "casual-player": {
    value: "casual-player",
    label: "Casual Player",
    emoji: "☁️",
    tagline: "Easy & Calm",
    description: "Gentle nudges that fit naturally into your day without pressure or stress.",
    colorName: "mint",
    cardBg: "var(--color-evolv-mint-soft)",
    accentBorder: "var(--color-evolv-mint)",
    homeBannerTitle: "Peace of Mind",
    homeBannerSubtitle: "Take each small step whenever you feel ready today.",
    completionActionLabel: "Mindful Moment",
  },
  "competitor": {
    value: "competitor",
    label: "Competitor",
    emoji: "🏆",
    tagline: "Personal Bests",
    description: "Track your personal consistency, level up, and beat your own records.",
    colorName: "amber",
    cardBg: "var(--color-evolv-amber-soft)",
    accentBorder: "var(--color-evolv-amber)",
    homeBannerTitle: "Daily Challenge",
    homeBannerSubtitle: "Outperform your past consistency with targeted momentum.",
    completionActionLabel: "View Record",
  },
  "explorer-builder": {
    value: "explorer-builder",
    label: "Explorer / Builder",
    emoji: "🌍",
    tagline: "Expand Your Space",
    description: "Each habit completed contributes vital energy toward building your realm.",
    colorName: "peach",
    cardBg: "var(--color-evolv-peach-soft)",
    accentBorder: "var(--color-evolv-peach)",
    homeBannerTitle: "World Expedition",
    homeBannerSubtitle: "Every completed mission channels vitality into expanding your world.",
    completionActionLabel: "Channel Energy",
  },
};

export function getPlayStyleConfig(playStyle: PlayStyle): PlayStyleConfig {
  return PLAY_STYLE_CONFIGS[playStyle] ?? PLAY_STYLE_CONFIGS["casual-player"];
}

/* ── Lightweight Interactions Bank ──────────────────────────────── */

const QUIZ_QUESTIONS: Record<string, QuizInteraction> = {
  physical: {
    type: "quiz",
    question: "How does a 10-minute walk boost your study focus?",
    options: [
      "Increases oxygen flow to prefrontal cortex",
      "Reduces heart rate to zero",
      "Decreases brain dopamine immediately"
    ],
    correctIndex: 0,
    explanation: "Light movement increases cerebral blood flow, sharpening alertness and memory retention for study sessions.",
  },
  digital: {
    type: "quiz",
    question: "Why does reducing screen time 30m before bed improve sleep?",
    options: [
      "Blue light mimics daylight, delaying melatonin",
      "Phones use more battery in the dark",
      "Screens increase room temperature"
    ],
    correctIndex: 0,
    explanation: "Blue light suppresses melatonin production, signalling your circadian clock to stay awake. Dimming screens enables natural sleep onset.",
  },
  "mental-reflective": {
    type: "quiz",
    question: "What is the primary benefit of a 3-minute breath reset?",
    options: [
      "Stimulates the parasympathetic nervous system",
      "Prevents you from breathing during exams",
      "Speeds up anxiety reactions"
    ],
    correctIndex: 0,
    explanation: "Slow exhales activate your vagus nerve, calming heart rate and down-regulating cortisol levels quickly.",
  },
  lifestyle: {
    type: "quiz",
    question: "Even mild dehydration (1-2%) primarily impairs:",
    options: [
      "Working memory and sustained attention",
      "Ability to hear high frequencies",
      "Finger nail growth speed"
    ],
    correctIndex: 0,
    explanation: "Dehydration reduces blood plasma volume, causing brain fatigue, headaches, and lower concentration within hours.",
  },
};

const PUZZLE_CLUES: Record<string, PuzzleInteraction> = {
  physical: {
    type: "puzzle",
    clueTitle: "Fragment of Momentum",
    clueText: "Ancient explorers walked 10,000 paces to map the coastlines. Your daily steps have unlocked the Compass of Vigor.",
    fragmentIcon: "🧭",
  },
  digital: {
    type: "puzzle",
    clueTitle: "Fragment of Stillness",
    clueText: "Stepping back from the glass screen revealed a hidden glade: The Valley of Quiet Focus.",
    fragmentIcon: "🌙",
  },
  "mental-reflective": {
    type: "puzzle",
    clueTitle: "Fragment of Clarity",
    clueText: "A clear breath parted the morning mist, uncovering a pathway toward inner balance.",
    fragmentIcon: "🔮",
  },
  lifestyle: {
    type: "puzzle",
    clueTitle: "Fragment of Vitality",
    clueText: "Pure hydration restored the fountain in the ancient courtyard. Vitality flows once more.",
    fragmentIcon: "💧",
  },
};

const CASUAL_AFFIRMATIONS: Record<string, CasualInteraction> = {
  physical: {
    type: "casual",
    affirmation: "Your body appreciates even the gentlest movement today.",
    reflectionPrompt: "Notice how your muscles feel when you release tension.",
  },
  digital: {
    type: "casual",
    affirmation: "Space away from screens gives your eyes and mind a restful pause.",
    reflectionPrompt: "Take a deep breath and let your eyes gaze at something distant.",
  },
  "mental-reflective": {
    type: "casual",
    affirmation: "Giving yourself 5 peaceful minutes is a powerful act of kindness.",
    reflectionPrompt: "No rush, no deadline. You did something kind for yourself.",
  },
  lifestyle: {
    type: "casual",
    affirmation: "Hydration and rest are simple essentials that restore your natural balance.",
    reflectionPrompt: "A cool glass of water is a fresh start for the rest of your day.",
  },
};

const COMPETITOR_MILESTONES: Record<string, CompetitorInteraction> = {
  physical: {
    type: "competitor",
    metricLabel: "Movement Consistency",
    personalRecordNote: "Target unlocked! You are building an unbreakable daily activity foundation.",
    nextMilestone: "Complete 2 more physical missions this week for a 100% active record.",
  },
  digital: {
    type: "competitor",
    metricLabel: "Focus Discipline",
    personalRecordNote: "Boundary secured! Screen time controlled before evening fatigue sets in.",
    nextMilestone: "Maintain digital boundaries for 3 consecutive evenings.",
  },
  "mental-reflective": {
    type: "competitor",
    metricLabel: "Mental Stamina",
    personalRecordNote: "Reset executed! Sharp minds recover proactively under pressure.",
    nextMilestone: "Unlock the 7-day Mental Fortitude streak badge.",
  },
  lifestyle: {
    type: "competitor",
    metricLabel: "Daily Fuel",
    personalRecordNote: "Hydration target banked! Your energy baseline is set.",
    nextMilestone: "Log 6+ glasses daily for peak academic focus.",
  },
};

const BUILDER_EXPANSIONS: Record<string, BuilderInteraction> = {
  physical: {
    type: "builder",
    worldArea: "Emerald Trailway",
    contributionNote: "Your movement cleared new pathways and laid stone paths across the Emerald Valley.",
    energyPoints: 35,
  },
  digital: {
    type: "builder",
    worldArea: "Sanctuary of Silence",
    contributionNote: "Stepping away from digital noise built a serene glass conservatory in your realm.",
    energyPoints: 30,
  },
  "mental-reflective": {
    type: "builder",
    worldArea: "Grove of Reflection",
    contributionNote: "Mindful stillness nurtured the ancient Spire Tree, causing golden leaves to bud.",
    energyPoints: 25,
  },
  lifestyle: {
    type: "builder",
    worldArea: "Crystal Spring",
    contributionNote: "Hydration restored the mountain springs, feeding the lush rivers of your world.",
    energyPoints: 30,
  },
};

/* ── Adapter Function ───────────────────────────────────────────── */

export function adaptMission(mission: Mission, playStyle: PlayStyle): AdaptedMission {
  const category = mission.category;

  // 1. Check if mission has custom playStyleFraming pre-generated
  const customFraming = mission.playStyleFraming?.[playStyle];

  let presentationTitle = mission.title;
  let presentationDescription = mission.description ?? "";
  let framingTag = "Daily Mission";
  let completionFeedback = "Mission completed!";
  let interaction: PlayStyleInteraction | undefined;

  switch (playStyle) {
    case "puzzle-explorer":
      framingTag = "Clue Fragment";
      completionFeedback = "🧩 Clue fragment uncovered!";
      interaction = PUZZLE_CLUES[category] ?? PUZZLE_CLUES["lifestyle"];
      if (customFraming) {
        presentationDescription = customFraming;
      } else {
        presentationDescription = `${mission.description ?? mission.title} - Complete this to reveal the next clue in your journey.`;
      }
      break;

    case "quiz-master":
      framingTag = "Knowledge Check";
      completionFeedback = "📚 Insight unlocked!";
      interaction = QUIZ_QUESTIONS[category] ?? QUIZ_QUESTIONS["lifestyle"];
      if (customFraming) {
        presentationDescription = customFraming;
      } else {
        presentationDescription = `${mission.description ?? mission.title} - Unlock a science-backed wellbeing insight.`;
      }
      break;

    case "casual-player":
      framingTag = "Gentle Step";
      completionFeedback = "☁️ Beautiful moment complete.";
      interaction = CASUAL_AFFIRMATIONS[category] ?? CASUAL_AFFIRMATIONS["lifestyle"];
      if (customFraming) {
        presentationDescription = customFraming;
      } else {
        presentationDescription = `${mission.description ?? mission.title} - Whenever it feels right today, at your own pace.`;
      }
      break;

    case "competitor":
      framingTag = "Personal Target";
      completionFeedback = "🏆 Milestone achieved!";
      interaction = COMPETITOR_MILESTONES[category] ?? COMPETITOR_MILESTONES["lifestyle"];
      if (customFraming) {
        presentationDescription = customFraming;
      } else {
        presentationDescription = `${mission.description ?? mission.title} - Step up your consistency and push your personal best.`;
      }
      break;

    case "explorer-builder":
      framingTag = "Realm Expansion";
      completionFeedback = "🌍 Realm expanded!";
      interaction = BUILDER_EXPANSIONS[category] ?? BUILDER_EXPANSIONS["lifestyle"];
      if (customFraming) {
        presentationDescription = customFraming;
      } else {
        presentationDescription = `${mission.description ?? mission.title} - Channels vitality toward expanding your world.`;
      }
      break;
  }

  return {
    ...mission,
    presentationTitle,
    presentationDescription,
    framingTag,
    completionFeedback,
    interaction,
  };
}
