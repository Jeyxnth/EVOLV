/**
 * Shared domain types for EVOLV.
 *
 * Phase 1: initial shapes.
 * Phase 4: Goal enriched with status, progress, description.
 * Phase 5: PlayerAIContext enriched with sleepPattern and screenTimePattern.
 * Fields will grow as each feature is implemented — treat these as stable but not final.
 */

export type WellbeingPriority = "mental" | "physical" | "balanced";

export type PlayStyle =
  | "puzzle-explorer"
  | "quiz-master"
  | "casual-player"
  | "competitor"
  | "explorer-builder";

/** Internal-only goal category. Never shown to the player. */
export type GoalCategory =
  | "physical-activity"
  | "sleep"
  | "stress-management"
  | "social-connection"
  | "academic-balance"
  | "screen-time"
  | "other";

export type GoalStatus = "active" | "completed" | "paused";

export interface Goal {
  id: string;
  /** User-facing label — shown directly in the UI */
  label: string;
  /** Optional longer description (pre-populated for suggested goals, empty for custom) */
  description?: string;
  /** Internal-only category — never shown to the player */
  category: GoalCategory;
  /** True if the user typed this themselves */
  isCustom: boolean;
  status: GoalStatus;
  /** 0–100, updated by mission completions in later phases */
  progress: number;
  createdAt: string; // ISO timestamp
}

/**
 * Structured, non-displayed context extracted from the AI conversation
 * (Phase 5). Drives mission/journey generation silently — never rendered
 * to the player.
 */
export interface PlayerAIContext {
  /** Free-text strings describing mental struggles (e.g. ["stress", "anxiety"]) */
  mentalStruggles: string[];
  /** Free-text strings describing physical challenges (e.g. ["low energy", "no routine"]) */
  physicalDifficulties: string[];
  /** Positive/neutral lifestyle observations (e.g. ["walks sometimes", "drinks water"]) */
  lifestyleHabits: string[];
  academicPressure: "low" | "medium" | "high" | "unknown";
  socialDifficulties: string[];
  /** Single sentence: what the player wants to feel/look like after progress */
  desiredOutcome: string;
  timeAvailability: "low" | "medium" | "high" | "unknown";
  currentActivityLevel: "low" | "medium" | "high" | "unknown";
  /** e.g. "irregular", "early", "late", "unknown" */
  sleepPattern: "irregular" | "early" | "late" | "consistent" | "unknown";
  /** e.g. "high", "moderate", "low", "unknown" */
  screenTimePattern: "high" | "moderate" | "low" | "unknown";
  /** Whether this context was produced by real Gemini or the fallback flow */
  source: "gemini" | "fallback";
  collectedAt: string; // ISO timestamp
}

export type MissionCategory =
  | "physical"
  | "mental-reflective"
  | "digital"
  | "lifestyle";

export type MissionCompletionMode = "manual" | "simulated";

export interface Mission {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: MissionCategory;
  playStyleFraming: Partial<Record<PlayStyle, string>>;
  xpReward: number;
  completionMode: MissionCompletionMode;
  completed: boolean;
  date: string; // ISO date (yyyy-mm-dd)
}

export interface WeeklyJourney {
  id: string;
  weekNumber: number;
  theme: string;
  focus: string;
  description: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  priority: WellbeingPriority;
  playStyle: PlayStyle;
  completedDays: string[]; // yyyy-mm-dd dates
  createdAt: string;
}

/** @deprecated Use DailyActivity instead — kept only for migration safety */
export interface ActivityData {
  date: string;
  steps?: number;
  distanceKm?: number;
  calories?: number;
  workoutMinutes?: number;
  sleepHours?: number;
  sleepConsistencyScore?: number;
  screenTimeMinutes?: number;
}

/**
 * DailyActivity — Phase 7 activity tracking record.
 *
 * All fields are optional so partial updates work cleanly.
 * Architecture is designed so future wearable/Health integrations only
 * need to write into these same fields (no schema change required).
 */
export interface DailyActivity {
  /** ISO date string yyyy-mm-dd — used as document key */
  date: string;
  /** Total steps walked (from manual entry or future phone sensor) */
  steps?: number;
  /** Minutes of deliberate walking */
  walkingMinutes?: number;
  /** Minutes of deliberate running */
  runningMinutes?: number;
  /** Hours of sleep last night */
  sleepHours?: number;
  /** Hours of total daily screen time (manual or future OS integration) */
  screenTimeHours?: number;
  /** Glasses of water consumed (1 glass ≈ 250 ml) */
  waterGlasses?: number;
  /** ISO timestamp of last update — used to show "last synced" */
  updatedAt: string;
}

/**
 * ActivityTargets — personalized, student-editable targets per metric.
 *
 * Starts as smart defaults derived from PlayerAIContext/onboarding baseline.
 * The student can adjust each target at any time.
 * Future adaptive logic can update these without a schema change.
 */
export interface ActivityTargets {
  /** Target daily steps */
  steps: number;
  /** Target walking minutes per day */
  walkingMinutes: number;
  /** Target running minutes per day */
  runningMinutes: number;
  /** Target sleep hours per night */
  sleepHours: number;
  /** Target max screen time hours per day */
  screenTimeHours: number;
  /** Target water glasses per day */
  waterGlasses: number;
  /** ISO timestamp of when targets were last edited */
  updatedAt: string;
}

export interface StreakState {
  currentStreak: number;
  /** Rolling window used for the "active N of last 7 days" rule. */
  activeDaysInWindow: number;
  windowSizeDays: number;
  lastActiveDate: string | null; // ISO date
}

export interface XPState {
  totalXp: number;
  level: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
}

/**
 * Core Gamification State (Phases 9 & 10)
 * Centralized, idempotent state for XP, Leveling, Streaks, and Realm Energy.
 */
export interface GamificationData {
  totalXp: number;
  currentLevel: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date (yyyy-mm-dd)
  /** Set of mission IDs that have already awarded XP (anti-exploit guarantee) */
  completedMissionIds: string[];
  /** Realm Energy used for world expansion and unlockable elements */
  realmEnergy: number;
  /** List of unlocked world element IDs */
  unlockedElementIds: string[];
  updatedAt: string;
}

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
  totalXp: number;
  newRealmEnergy?: number;
}

export interface PlayerProfile {
  uid: string;
  isDemo: boolean;
  displayName: string;
  priority: WellbeingPriority | null;
  playStyle: PlayStyle | null;
  goals: Goal[];
  aiContext: PlayerAIContext | null;
  xp: XPState;
  streak: StreakState;
  createdAt: string;
  updatedAt: string;
}

export type AdaptationTrigger =
  | "low-completion"
  | "high-completion"
  | "sleep-change"
  | "screen-time-change"
  | "player-feedback"
  | "long-term-inactivity";

export interface AdaptationEvent {
  id: string;
  trigger: AdaptationTrigger;
  /** Deterministic, rule-based explanation — always shown to the player. */
  explanation: string;
  createdAt: string;
}

/* ── Phase 10: Virtual Companion & World Progression ──────────────── */

export type CompanionStage = "seedling" | "budding" | "flourishing";
export type CompanionState = "idle" | "happy" | "excited" | "encouraging" | "resting";

export interface CompanionData {
  name: string;
  stage: CompanionStage;
  state: CompanionState;
  level: number;
  stageTitle: string;
  stageDescription: string;
  auraColor: string;
}

export interface WorldElement {
  id: string;
  name: string;
  icon: string;
  requiredEnergy: number;
  requiredLevel: number;
  description: string;
  narrativeUnlocked: string;
  unlocked: boolean;
  color: "primary" | "mint" | "sky" | "amber";
}

export interface CentralStructureStage {
  stage: "early" | "mid" | "advanced";
  stageNumber: number;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  minEnergy: number;
  minLevel: number;
}

export interface PlayStyleWorldConfig {
  playStyle: PlayStyle;
  regionName: string;
  worldTheme: string;
  tagline: string;
  skyGradient: string;
  sunGlow: string;
  hillColors: [string, string, string];
  centralStructure: {
    baseName: string;
    stages: CentralStructureStage[];
    currentStage: CentralStructureStage;
  };
  elements: WorldElement[];
  milestoneTitle: string;
  progressionNote: string;
}

export interface RealmArea {
  id: string;
  name: string;
  icon: string;
  unlockLevel: number;
  unlockXp: number;
  title: string;
  description: string;
  lore: string;
  atmosphere: string;
  color: "primary" | "mint" | "sky" | "amber";
  unlocked: boolean;
}

export interface WorldProgression {
  currentRealmName: string;
  unlockedAreasCount: number;
  totalAreasCount: number;
  currentArea: RealmArea;
  nextArea: RealmArea | null;
  xpToNextArea: number;
  progressToNextAreaPct: number;
  vitalityXp: number;
  realmEnergy: number;
  nextElement: WorldElement | null;
  energyToNextElement: number;
  progressToNextElementPct: number;
  elements: WorldElement[];
  areas: RealmArea[];
}


