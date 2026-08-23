/**
 * test_phase10_companion_world.js — Automated test suite for Phase 10:
 * Virtual Companion & World Progression.
 */
import assert from "node:assert";

console.log("=== RUNNING PHASE 10: VIRTUAL COMPANION & WORLD PROGRESSION TESTS ===\n");

// ── Companion Logic Mirror ─────────────────────────────────────────
function calculateCompanionStage(level, totalXp) {
  if (level >= 6 || totalXp >= 700) {
    return "flourishing";
  }
  if (level >= 3 || totalXp >= 250) {
    return "budding";
  }
  return "seedling";
}

const COMPANION_STAGE_INFO = {
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

function getCompanionData(level, totalXp, state = "idle", customName = "Lumi") {
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

function getCompanionEncouragement(companion, context) {
  const { completedMissionsToday, currentStreak, playStyle } = context;

  if (completedMissionsToday >= 3) {
    return "You've completed all missions today! Your light is shining bright ✨";
  }
  if (completedMissionsToday > 0) {
    return `${completedMissionsToday} mission${completedMissionsToday > 1 ? "s" : ""} done today! Every step counts 🌱`;
  }

  if (currentStreak >= 3) {
    return `${currentStreak} days of steady momentum! Let's take it one step at a time today 🔥`;
  }

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

// ── World Progression Logic Mirror ─────────────────────────────────
const REALM_AREAS_CONFIG = [
  {
    id: "restful-hollow",
    name: "Restful Hollow",
    icon: "🌙",
    unlockLevel: 1,
    unlockXp: 0,
    title: "Sanctuary of Rest & Morning Dawn",
  },
  {
    id: "trail-ridge",
    name: "Trail Ridge",
    icon: "⛰️",
    unlockLevel: 3,
    unlockXp: 250,
    title: "Alpine Foothills of Energy & Movement",
  },
  {
    id: "focus-grove",
    name: "Focus Grove",
    icon: "🌿",
    unlockLevel: 5,
    unlockXp: 450,
    title: "Ancient Grove of Reflection & Clarity",
  },
  {
    id: "sun-arena",
    name: "Sun Arena",
    icon: "☀️",
    unlockLevel: 8,
    unlockXp: 1000,
    title: "Radiant Sanctuary of Flourishing Vitality",
  },
];

function calculateWorldProgression(level, totalXp) {
  const areas = REALM_AREAS_CONFIG.map((cfg) => ({
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

  return {
    currentRealmName: "The Meadow",
    unlockedAreasCount: unlockedAreas.length,
    totalAreasCount: areas.length,
    currentArea,
    nextArea,
    xpToNextArea,
    progressToNextAreaPct,
    vitalityXp: totalXp,
    areas,
  };
}

// ── 1. Testing Companion Stages ─────────────────────────────────────
console.log("1. Testing Companion Developmental Stages...");

const stage1 = calculateCompanionStage(1, 50);
assert.strictEqual(stage1, "seedling", "Level 1 should be seedling");

const stage2 = calculateCompanionStage(2, 180);
assert.strictEqual(stage2, "seedling", "Level 2 should be seedling");

const stage3 = calculateCompanionStage(3, 250);
assert.strictEqual(stage3, "budding", "Level 3 should be budding");

const stage4 = calculateCompanionStage(5, 550);
assert.strictEqual(stage4, "budding", "Level 5 should be budding");

const stage5 = calculateCompanionStage(6, 700);
assert.strictEqual(stage5, "flourishing", "Level 6 should be flourishing");

const stage6 = calculateCompanionStage(9, 1500);
assert.strictEqual(stage6, "flourishing", "Level 9 should be flourishing");

console.log("  ✓ Level 1 (50 XP) -> Seedling Spark");
console.log("  ✓ Level 3 (250 XP) -> Budding Sprout");
console.log("  ✓ Level 6 (700 XP) -> Flourishing Luminary");

// ── 2. Testing Companion Data & Dialogue ────────────────────────────
console.log("\n2. Testing Companion Contextual Encouragement...");

const comp = getCompanionData(3, 250);
assert.strictEqual(comp.stage, "budding");
assert.strictEqual(comp.stageTitle, "Budding Sprout");

const msgZero = getCompanionEncouragement(comp, {
  completedMissionsToday: 0,
  currentStreak: 1,
  playStyle: "casual-player",
});
assert.ok(msgZero.includes("Take your time"), "Zero missions should give gentle greeting");

const msgMissions = getCompanionEncouragement(comp, {
  completedMissionsToday: 2,
  currentStreak: 3,
  playStyle: "casual-player",
});
assert.ok(msgMissions.includes("2 missions done today"), "Should acknowledge completed missions");

const msgStreak = getCompanionEncouragement(comp, {
  completedMissionsToday: 0,
  currentStreak: 5,
  playStyle: "competitor",
});
assert.ok(msgStreak.includes("5 days of steady momentum"), "Should acknowledge streak momentum");

const msgPuzzle = getCompanionEncouragement(comp, {
  completedMissionsToday: 0,
  currentStreak: 1,
  playStyle: "puzzle-explorer",
});
assert.ok(msgPuzzle.includes("piece of your world"), "Should adapt to puzzle explorer style");

console.log("  ✓ Zero missions greeting: " + msgZero);
console.log("  ✓ Missions milestone greeting: " + msgMissions);
console.log("  ✓ Play-style greeting (Puzzle): " + msgPuzzle);

// ── 3. Testing World Progression & Realm Unlocks ───────────────────
console.log("\n3. Testing World Progression & Sanctuary Unlocks...");

const worldL1 = calculateWorldProgression(1, 80);
assert.strictEqual(worldL1.unlockedAreasCount, 1);
assert.strictEqual(worldL1.currentArea.name, "Restful Hollow");
assert.strictEqual(worldL1.nextArea?.name, "Trail Ridge");
assert.strictEqual(worldL1.xpToNextArea, 170); // 250 - 80 = 170

const worldL3 = calculateWorldProgression(3, 300);
assert.strictEqual(worldL3.unlockedAreasCount, 2);
assert.strictEqual(worldL3.currentArea.name, "Trail Ridge");
assert.strictEqual(worldL3.nextArea?.name, "Focus Grove");
assert.strictEqual(worldL3.xpToNextArea, 150); // 450 - 300 = 150

const worldL5 = calculateWorldProgression(5, 600);
assert.strictEqual(worldL5.unlockedAreasCount, 3);
assert.strictEqual(worldL5.currentArea.name, "Focus Grove");
assert.strictEqual(worldL5.nextArea?.name, "Sun Arena");
assert.strictEqual(worldL5.xpToNextArea, 400); // 1000 - 600 = 400

const worldL8 = calculateWorldProgression(8, 1100);
assert.strictEqual(worldL8.unlockedAreasCount, 4);
assert.strictEqual(worldL8.currentArea.name, "Sun Arena");
assert.strictEqual(worldL8.nextArea, null);
assert.strictEqual(worldL8.progressToNextAreaPct, 100);

console.log("  ✓ Level 1 (80 XP) -> Restful Hollow active, 170 XP to Trail Ridge");
console.log("  ✓ Level 3 (300 XP) -> Trail Ridge active, 150 XP to Focus Grove");
console.log("  ✓ Level 5 (600 XP) -> Focus Grove active, 400 XP to Sun Arena");
console.log("  ✓ Level 8 (1100 XP) -> All 4 Sanctuaries Flourishing");

console.log("\n==================================================");
console.log("✅ ALL PHASE 10 COMPANION & WORLD TESTS PASSED!");
console.log("==================================================");
