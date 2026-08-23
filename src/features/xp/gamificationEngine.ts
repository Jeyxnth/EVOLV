/**
 * gamificationEngine.ts — Core XP, Leveling, and Streak calculation engine for EVOLV.
 *
 * Implements:
 * 1. Scaling level curve (Level 1: 0–99 XP, Level 2: 100–249 XP, Level 3: 250–449 XP...)
 * 2. Idempotent mission XP processing with anti-exploit guarantees.
 * 3. Daily streak calculation with supportive recovery semantics.
 */
import type { GamificationData, Mission, LevelUpEvent } from "../../types";

/**
 * Level progression requirements:
 * Level 1: 100 XP to Level 2 (Total XP: 0–99)
 * Level 2: 150 XP to Level 3 (Total XP: 100–249)
 * Level 3: 200 XP to Level 4 (Total XP: 250–449)
 * Level 4: 250 XP to Level 5 (Total XP: 450–699)
 * Level L: requires 50 + 50 * L XP to reach Level L+1
 */
export function getXPRequiredForLevel(level: number): number {
  return 50 + 50 * level;
}

export interface XPProgressResult {
  level: number;
  totalXp: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  percentage: number;
}

/**
 * Calculate level, xp into current level, and xp to next level from total XP.
 */
export function calculateXPProgress(totalXp: number): XPProgressResult {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));
  let currentLevel = 1;
  let remainingXp = safeXp;

  while (true) {
    const requiredForCurrent = getXPRequiredForLevel(currentLevel);
    if (remainingXp < requiredForCurrent) {
      const percentage = Math.min(
        100,
        Math.round((remainingXp / requiredForCurrent) * 100),
      );
      return {
        level: currentLevel,
        totalXp: safeXp,
        xpIntoCurrentLevel: remainingXp,
        xpToNextLevel: requiredForCurrent,
        percentage,
      };
    }
    remainingXp -= requiredForCurrent;
    currentLevel++;
  }
}

/**
 * Helper to get the previous calendar day string (yyyy-mm-dd) in local time.
 * Avoids UTC timezone conversion shifts.
 */
export function getYesterdayDateString(todayDate: string): string {
  const parts = todayDate.split("-").map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 1;
  const day = parts[2] || 1;

  const base = new Date(year, month - 1, day);
  base.setDate(base.getDate() - 1);

  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface StreakCalculationResult {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  isNewStreakDay: boolean;
  streakStatus: "continued" | "started" | "already-counted";
}

/**
 * Calculate daily engagement streak based on calendar dates.
 * Guaranteed idempotency: multiple missions on same day do not increase streak count.
 */
export function calculateStreak(
  lastCompletedDate: string | null,
  currentStreak: number,
  longestStreak: number,
  todayDate: string,
): StreakCalculationResult {
  // If already completed a mission today, streak is maintained without incrementing
  if (lastCompletedDate === todayDate) {
    return {
      currentStreak: Math.max(1, currentStreak),
      longestStreak: Math.max(longestStreak, currentStreak, 1),
      lastCompletedDate: todayDate,
      isNewStreakDay: false,
      streakStatus: "already-counted",
    };
  }

  const yesterdayDate = getYesterdayDateString(todayDate);

  if (lastCompletedDate === yesterdayDate) {
    // Consecutive day completion: increment streak
    const newStreak = Math.max(1, currentStreak + 1);
    const newLongest = Math.max(longestStreak, newStreak);
    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: todayDate,
      isNewStreakDay: true,
      streakStatus: "continued",
    };
  }

  // Missed day or first mission ever: start fresh streak at 1
  const newStreak = 1;
  const newLongest = Math.max(longestStreak, 1);
  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCompletedDate: todayDate,
    isNewStreakDay: true,
    streakStatus: "started",
  };
}

export interface MissionCompletionResult {
  gamification: GamificationData;
  xpAwarded: number;
  realmEnergyAwarded: number;
  leveledUp: boolean;
  levelUpEvent: LevelUpEvent | null;
  streakResult: StreakCalculationResult;
  isDuplicate: boolean;
}

/**
 * Process a mission completion transition idempotently.
 *
 * Guarantees:
 * - A mission only awards XP and Realm Energy once (tracked via completedMissionIds).
 * - Streaks increment at most once per calendar day.
 * - Dispatches LevelUpEvent if a level threshold is crossed.
 */
export function processMissionCompletion(
  currentGamification: GamificationData,
  mission: Mission,
  todayDate: string,
): MissionCompletionResult {
  const completedIds = new Set(currentGamification.completedMissionIds || []);
  const currentRealmEnergy = currentGamification.realmEnergy ?? (currentGamification.totalXp ? Math.floor(currentGamification.totalXp / 3) : 0);
  const currentUnlockedElements = currentGamification.unlockedElementIds ?? [];

  // Anti-exploit check: Already awarded XP for this mission?
  if (completedIds.has(mission.id)) {
    const progress = calculateXPProgress(currentGamification.totalXp);
    return {
      gamification: {
        ...currentGamification,
        currentLevel: progress.level,
        xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
        xpToNextLevel: progress.xpToNextLevel,
        realmEnergy: currentRealmEnergy,
        unlockedElementIds: currentUnlockedElements,
      },
      xpAwarded: 0,
      realmEnergyAwarded: 0,
      leveledUp: false,
      levelUpEvent: null,
      streakResult: {
        currentStreak: currentGamification.currentStreak,
        longestStreak: currentGamification.longestStreak,
        lastCompletedDate: currentGamification.lastCompletedDate || todayDate,
        isNewStreakDay: false,
        streakStatus: "already-counted",
      },
      isDuplicate: true,
    };
  }

  // Award XP and Realm Energy
  const xpReward = mission.xpReward > 0 ? mission.xpReward : 20;
  const realmEnergyReward = Math.max(5, Math.round(xpReward / 2)); // e.g. 10 XP -> 5 RE, 20 XP -> 10 RE, 30 XP -> 15 RE
  const newTotalXp = currentGamification.totalXp + xpReward;
  const newRealmEnergy = currentRealmEnergy + realmEnergyReward;
  const oldLevel = currentGamification.currentLevel;
  const progress = calculateXPProgress(newTotalXp);

  // Update streak
  const streakResult = calculateStreak(
    currentGamification.lastCompletedDate,
    currentGamification.currentStreak,
    currentGamification.longestStreak,
    todayDate,
  );

  const leveledUp = progress.level > oldLevel;
  const levelUpEvent: LevelUpEvent | null = leveledUp
    ? {
        previousLevel: oldLevel,
        newLevel: progress.level,
        totalXp: newTotalXp,
        newRealmEnergy: newRealmEnergy,
      }
    : null;

  completedIds.add(mission.id);

  const updatedGamification: GamificationData = {
    totalXp: newTotalXp,
    currentLevel: progress.level,
    xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
    xpToNextLevel: progress.xpToNextLevel,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    lastCompletedDate: streakResult.lastCompletedDate,
    completedMissionIds: Array.from(completedIds),
    realmEnergy: newRealmEnergy,
    unlockedElementIds: currentUnlockedElements,
    updatedAt: new Date().toISOString(),
  };

  return {
    gamification: updatedGamification,
    xpAwarded: xpReward,
    realmEnergyAwarded: realmEnergyReward,
    leveledUp,
    levelUpEvent,
    streakResult,
    isDuplicate: false,
  };
}

/**
 * Creates default gamification state for a brand new user.
 */
export function createInitialGamificationData(): GamificationData {
  return {
    totalXp: 0,
    currentLevel: 1,
    xpIntoCurrentLevel: 0,
    xpToNextLevel: getXPRequiredForLevel(1),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    completedMissionIds: [],
    realmEnergy: 0,
    unlockedElementIds: [],
    updatedAt: new Date().toISOString(),
  };
}
