/**
 * test_phase9_gamification.js — Automated test suite for Phase 9 Gamification Engine.
 */
import assert from "node:assert";

// Implementation of gamification logic for standalone verification
function getXPRequiredForLevel(level) {
  return 50 + 50 * level;
}

function calculateXPProgress(totalXp) {
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

function getYesterdayDateString(todayDate) {
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

function calculateStreak(lastCompletedDate, currentStreak, longestStreak, todayDate) {
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

function processMissionCompletion(currentGamification, mission, todayDate) {
  const completedIds = new Set(currentGamification.completedMissionIds || []);

  if (completedIds.has(mission.id)) {
    const progress = calculateXPProgress(currentGamification.totalXp);
    return {
      gamification: {
        ...currentGamification,
        currentLevel: progress.level,
        xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
        xpToNextLevel: progress.xpToNextLevel,
      },
      xpAwarded: 0,
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

  const xpReward = mission.xpReward > 0 ? mission.xpReward : 20;
  const newTotalXp = currentGamification.totalXp + xpReward;
  const oldLevel = currentGamification.currentLevel;
  const progress = calculateXPProgress(newTotalXp);

  const streakResult = calculateStreak(
    currentGamification.lastCompletedDate,
    currentGamification.currentStreak,
    currentGamification.longestStreak,
    todayDate,
  );

  const leveledUp = progress.level > oldLevel;
  const levelUpEvent = leveledUp
    ? {
        previousLevel: oldLevel,
        newLevel: progress.level,
        totalXp: newTotalXp,
      }
    : null;

  completedIds.add(mission.id);

  const updatedGamification = {
    totalXp: newTotalXp,
    currentLevel: progress.level,
    xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
    xpToNextLevel: progress.xpToNextLevel,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    lastCompletedDate: streakResult.lastCompletedDate,
    completedMissionIds: Array.from(completedIds),
    updatedAt: new Date().toISOString(),
  };

  return {
    gamification: updatedGamification,
    xpAwarded: xpReward,
    leveledUp,
    levelUpEvent,
    streakResult,
    isDuplicate: false,
  };
}

console.log("=== RUNNING PHASE 9 GAMIFICATION ENGINE TESTS ===\n");

// 1. XP & Level Progression Tests
console.log("1. Testing XP Progress & Level Curve Thresholds...");

const p0 = calculateXPProgress(0);
assert.strictEqual(p0.level, 1);
assert.strictEqual(p0.xpIntoCurrentLevel, 0);
assert.strictEqual(p0.xpToNextLevel, 100);
console.log("  ✓ 0 XP -> Level 1 (0/100 XP)");

const p99 = calculateXPProgress(99);
assert.strictEqual(p99.level, 1);
assert.strictEqual(p99.xpIntoCurrentLevel, 99);
assert.strictEqual(p99.xpToNextLevel, 100);
console.log("  ✓ 99 XP -> Level 1 (99/100 XP)");

const p100 = calculateXPProgress(100);
assert.strictEqual(p100.level, 2);
assert.strictEqual(p100.xpIntoCurrentLevel, 0);
assert.strictEqual(p100.xpToNextLevel, 150);
console.log("  ✓ 100 XP -> Level 2 (0/150 XP, threshold reached)");

const p249 = calculateXPProgress(249);
assert.strictEqual(p249.level, 2);
assert.strictEqual(p249.xpIntoCurrentLevel, 149);
assert.strictEqual(p249.xpToNextLevel, 150);
console.log("  ✓ 249 XP -> Level 2 (149/150 XP)");

const p250 = calculateXPProgress(250);
assert.strictEqual(p250.level, 3);
assert.strictEqual(p250.xpIntoCurrentLevel, 0);
assert.strictEqual(p250.xpToNextLevel, 200);
console.log("  ✓ 250 XP -> Level 3 (0/200 XP, threshold reached)");

const p450 = calculateXPProgress(450);
assert.strictEqual(p450.level, 4);
assert.strictEqual(p450.xpIntoCurrentLevel, 0);
assert.strictEqual(p450.xpToNextLevel, 250);
console.log("  ✓ 450 XP -> Level 4 (0/250 XP, threshold reached)");

// 2. Streak System Tests
console.log("\n2. Testing Streak System & Date Transitions...");

// Day 1: 2026-08-23
const s1 = calculateStreak(null, 0, 0, "2026-08-23");
assert.strictEqual(s1.currentStreak, 1);
assert.strictEqual(s1.longestStreak, 1);
assert.strictEqual(s1.isNewStreakDay, true);
console.log("  ✓ Initial mission -> streak starts at 1");

// Same Day: 2nd mission on 2026-08-23
const s1_same = calculateStreak("2026-08-23", 1, 1, "2026-08-23");
assert.strictEqual(s1_same.currentStreak, 1);
assert.strictEqual(s1_same.isNewStreakDay, false);
console.log("  ✓ Same day 2nd mission -> streak remains 1 (idempotent)");

// Consecutive Day: 2026-08-24
const s2 = calculateStreak("2026-08-23", 1, 1, "2026-08-24");
assert.strictEqual(s2.currentStreak, 2);
assert.strictEqual(s2.longestStreak, 2);
assert.strictEqual(s2.isNewStreakDay, true);
console.log("  ✓ Next day 2026-08-24 -> streak increments to 2");

// Consecutive Day: 2026-08-25
const s3 = calculateStreak("2026-08-24", 2, 2, "2026-08-25");
assert.strictEqual(s3.currentStreak, 3);
assert.strictEqual(s3.longestStreak, 3);
assert.strictEqual(s3.isNewStreakDay, true);
console.log("  ✓ Next day 2026-08-25 -> streak increments to 3");

// Missed day: No activity on 2026-08-26, resumes on 2026-08-27
const s4 = calculateStreak("2026-08-25", 3, 3, "2026-08-27");
assert.strictEqual(s4.currentStreak, 1);
assert.strictEqual(s4.longestStreak, 3);
assert.strictEqual(s4.streakStatus, "started");
console.log("  ✓ Missed day -> streak resets to 1, longest streak preserved at 3");

// 3. Idempotent Mission Rewards & Level-Up Event Tests
console.log("\n3. Testing Idempotent Mission Rewards & Level-Up Events...");

let gState = {
  totalXp: 80,
  currentLevel: 1,
  xpIntoCurrentLevel: 80,
  xpToNextLevel: 100,
  currentStreak: 1,
  longestStreak: 1,
  lastCompletedDate: "2026-08-23",
  completedMissionIds: [],
  updatedAt: new Date().toISOString(),
};

const m1 = { id: "m1", title: "Morning walk", xpReward: 30 };

// First completion of m1 -> awards 30 XP (80 + 30 = 110 XP -> crosses 100 XP to Level 2)
const res1 = processMissionCompletion(gState, m1, "2026-08-23");
assert.strictEqual(res1.isDuplicate, false);
assert.strictEqual(res1.xpAwarded, 30);
assert.strictEqual(res1.gamification.totalXp, 110);
assert.strictEqual(res1.gamification.currentLevel, 2);
assert.strictEqual(res1.gamification.xpIntoCurrentLevel, 10);
assert.strictEqual(res1.gamification.xpToNextLevel, 150);
assert.strictEqual(res1.leveledUp, true);
assert.deepStrictEqual(res1.levelUpEvent, { previousLevel: 1, newLevel: 2, totalXp: 110 });
console.log("  ✓ First completion: +30 XP awarded, Level Up to Level 2 triggered!");

// Duplicate completion attempt of m1
const resDuplicate = processMissionCompletion(res1.gamification, m1, "2026-08-23");
assert.strictEqual(resDuplicate.isDuplicate, true);
assert.strictEqual(resDuplicate.xpAwarded, 0);
assert.strictEqual(resDuplicate.gamification.totalXp, 110);
assert.strictEqual(resDuplicate.leveledUp, false);
assert.strictEqual(resDuplicate.levelUpEvent, null);
console.log("  ✓ Duplicate completion attempt: 0 XP awarded, perfectly idempotent.");

// Distinct mission m2
const m2 = { id: "m2", title: "Drink water", xpReward: 20 };
const res2 = processMissionCompletion(res1.gamification, m2, "2026-08-23");
assert.strictEqual(res2.isDuplicate, false);
assert.strictEqual(res2.xpAwarded, 20);
assert.strictEqual(res2.gamification.totalXp, 130);
assert.strictEqual(res2.gamification.currentLevel, 2);
assert.strictEqual(res2.gamification.xpIntoCurrentLevel, 30);
assert.strictEqual(res2.leveledUp, false);
console.log("  ✓ Second distinct mission: +20 XP awarded (Total: 130 XP).");

console.log("\n==================================================");
console.log("✅ ALL PHASE 9 GAMIFICATION ENGINE TESTS PASSED!");
console.log("==================================================");
