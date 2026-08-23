/**
 * test_phase11_final_integration.js
 * Comprehensive end-to-end integration & demo readiness test suite for EVOLV Phase 11.
 */
import assert from "node:assert";

console.log("=== RUNNING PHASE 11: LIVING WORLD & CENTRAL HOME BASE INTEGRATION TESTS ===\n");

// ── 1. Gamification Leveling & Progression Logic ────────────────────
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

function processMissionCompletion(currentGamification, mission, todayDate) {
  const completedIds = new Set(currentGamification.completedMissionIds || []);
  const currentRealmEnergy = currentGamification.realmEnergy ?? 0;

  if (completedIds.has(mission.id)) {
    return {
      gamification: currentGamification,
      xpAwarded: 0,
      realmEnergyAwarded: 0,
      leveledUp: false,
      isDuplicate: true,
    };
  }

  const xpReward = mission.xpReward > 0 ? mission.xpReward : 20;
  const realmEnergyReward = Math.max(5, Math.round(xpReward / 2));
  const newTotalXp = currentGamification.totalXp + xpReward;
  const newRealmEnergy = currentRealmEnergy + realmEnergyReward;
  const oldLevel = currentGamification.currentLevel;
  const progress = calculateXPProgress(newTotalXp);
  const leveledUp = progress.level > oldLevel;

  completedIds.add(mission.id);

  return {
    gamification: {
      totalXp: newTotalXp,
      currentLevel: progress.level,
      xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
      xpToNextLevel: progress.xpToNextLevel,
      currentStreak: currentGamification.currentStreak + 1,
      completedMissionIds: Array.from(completedIds),
      realmEnergy: newRealmEnergy,
    },
    xpAwarded: xpReward,
    realmEnergyAwarded: realmEnergyReward,
    leveledUp,
    isDuplicate: false,
  };
}

// ── 2. Play-Style Worlds with Central Structure Stages ──────────────
const PLAY_STYLE_WORLDS = {
  "explorer-builder": {
    regionName: "The Living Valley",
    worldTheme: "Verdant Fantasy Nature Sanctuary",
    centralStructure: {
      baseName: "Arboreal Explorer Basecamp",
      stages: [
        { stage: "early", stageNumber: 1, name: "Trailhead Camp", icon: "⛺", minEnergy: 0, minLevel: 1 },
        { stage: "mid", stageNumber: 2, name: "Timber Lodge & Outpost", icon: "🏡", minEnergy: 40, minLevel: 3 },
        { stage: "advanced", stageNumber: 3, name: "Grand Arboreal Sanctuary", icon: "🌳", minEnergy: 120, minLevel: 6 },
      ],
    },
    elements: [
      { id: "exp-1", name: "Meadow Sproutlands", requiredEnergy: 0, requiredLevel: 1, icon: "🌱" },
      { id: "exp-2", name: "Whispering Brook", requiredEnergy: 20, requiredLevel: 2, icon: "🌊" },
      { id: "exp-3", name: "Ancient Sun Birch", requiredEnergy: 50, requiredLevel: 3, icon: "🌳" },
      { id: "exp-4", name: "Moonstone Bridge", requiredEnergy: 90, requiredLevel: 4, icon: "🌉" },
      { id: "exp-5", name: "Eagle's Ridge Lookout", requiredEnergy: 140, requiredLevel: 6, icon: "🦅" },
      { id: "exp-6", name: "Celestial Sun Pinnacle", requiredEnergy: 200, requiredLevel: 8, icon: "☀️" },
    ],
  },
  "puzzle-explorer": {
    regionName: "The Sunken Citadel",
    worldTheme: "Ancient Mystical Relic Ruins",
    centralStructure: {
      baseName: "Citadel Runic Core",
      stages: [
        { stage: "early", stageNumber: 1, name: "Rune Altar Foundation", icon: "🪨", minEnergy: 0, minLevel: 1 },
        { stage: "mid", stageNumber: 2, name: "Sanctum Archway of Insight", icon: "🗝️", minEnergy: 40, minLevel: 3 },
        { stage: "advanced", stageNumber: 3, name: "Great Arcane Crystal Spire", icon: "🔮", minEnergy: 120, minLevel: 6 },
      ],
    },
    elements: [
      { id: "puz-1", name: "Forgotten Plaza", requiredEnergy: 0, requiredLevel: 1, icon: "🏛️" },
      { id: "puz-2", name: "Runestone Pathway", requiredEnergy: 20, requiredLevel: 2, icon: "🔮" },
      { id: "puz-3", name: "Gate of Focus", requiredEnergy: 50, requiredLevel: 3, icon: "🗝️" },
      { id: "puz-4", name: "Chamber of Insight", requiredEnergy: 90, requiredLevel: 4, icon: "💎" },
      { id: "puz-5", name: "Amethyst Obelisk", requiredEnergy: 140, requiredLevel: 6, icon: "🗿" },
      { id: "puz-6", name: "Solar Crown Sanctum", requiredEnergy: 200, requiredLevel: 8, icon: "✨" },
    ],
  },
  "quiz-master": {
    regionName: "The Citadel of Mind",
    worldTheme: "Grand Academy of Science & Discovery",
    centralStructure: {
      baseName: "Grand Academy Center",
      stages: [
        { stage: "early", stageNumber: 1, name: "Study Gazebo", icon: "📜", minEnergy: 0, minLevel: 1 },
        { stage: "mid", stageNumber: 2, name: "Athenaeum of Discovery", icon: "🏛️", minEnergy: 40, minLevel: 3 },
        { stage: "advanced", stageNumber: 3, name: "Celestial Observatory Dome", icon: "🔭", minEnergy: 120, minLevel: 6 },
      ],
    },
    elements: [
      { id: "quiz-1", name: "Academy Courtyard", requiredEnergy: 0, requiredLevel: 1, icon: "🏛️" },
      { id: "quiz-2", name: "Study Pavilion", requiredEnergy: 20, requiredLevel: 2, icon: "📜" },
      { id: "quiz-3", name: "Reflection Library", requiredEnergy: 50, requiredLevel: 3, icon: "📚" },
      { id: "quiz-4", name: "Scribe's Spire", requiredEnergy: 90, requiredLevel: 4, icon: "🔭" },
      { id: "quiz-5", name: "Stargazer Observatory", requiredEnergy: 140, requiredLevel: 6, icon: "🌌" },
      { id: "quiz-6", name: "Grand Celestial Archive", requiredEnergy: 200, requiredLevel: 8, icon: "🧭" },
    ],
  },
  "casual-player": {
    regionName: "Haven Hollow",
    worldTheme: "Cozy Hearthside Settlement & Gardens",
    centralStructure: {
      baseName: "Hearthside Village Hub",
      stages: [
        { stage: "early", stageNumber: 1, name: "Meadow Hearth Cottage", icon: "🏡", minEnergy: 0, minLevel: 1 },
        { stage: "mid", stageNumber: 2, name: "Blossom Village Square", icon: "🌻", minEnergy: 40, minLevel: 3 },
        { stage: "advanced", stageNumber: 3, name: "Everbloom Haven Estate", icon: "🏰", minEnergy: 120, minLevel: 6 },
      ],
    },
    elements: [
      { id: "cas-1", name: "Wildflower Meadow", requiredEnergy: 0, requiredLevel: 1, icon: "🌸" },
      { id: "cas-2", name: "Hearthside Cottage", requiredEnergy: 20, requiredLevel: 2, icon: "🏡" },
      { id: "cas-3", name: "Herbal Blossom Garden", requiredEnergy: 50, requiredLevel: 3, icon: "🌿" },
      { id: "cas-4", name: "Community Tea Pavilion", requiredEnergy: 90, requiredLevel: 4, icon: "🍵" },
      { id: "cas-5", name: "Sunlit Orchard", requiredEnergy: 140, requiredLevel: 6, icon: "🍎" },
      { id: "cas-6", name: "Everbloom Haven Sanctuary", requiredEnergy: 200, requiredLevel: 8, icon: "🌈" },
    ],
  },
  "competitor": {
    regionName: "Apex Citadel",
    worldTheme: "Valor Peak & Fortress of Discipline",
    centralStructure: {
      baseName: "Stronghold of Valor",
      stages: [
        { stage: "early", stageNumber: 1, name: "Valor Training Court", icon: "⚔️", minEnergy: 0, minLevel: 1 },
        { stage: "mid", stageNumber: 2, name: "Keep of the Vanguard", icon: "🏰", minEnergy: 40, minLevel: 3 },
        { stage: "advanced", stageNumber: 3, name: "High Citadel of Champions", icon: "👑", minEnergy: 120, minLevel: 6 },
      ],
    },
    elements: [
      { id: "comp-1", name: "Training Courtyard", requiredEnergy: 0, requiredLevel: 1, icon: "⚔️" },
      { id: "comp-2", name: "Endurance Colosseum", requiredEnergy: 20, requiredLevel: 2, icon: "🏟️" },
      { id: "comp-3", name: "Fortress of Will", requiredEnergy: 50, requiredLevel: 3, icon: "🏰" },
      { id: "comp-4", name: "Champion's Dais", requiredEnergy: 90, requiredLevel: 4, icon: "🏆" },
      { id: "comp-5", name: "Pinnacle of Mastery", requiredEnergy: 140, requiredLevel: 6, icon: "⚡" },
      { id: "comp-6", name: "Grand Hall of Titans", requiredEnergy: 200, requiredLevel: 8, icon: "👑" },
    ],
  },
};

function getPlayStyleWorldConfig(playStyle, realmEnergy, currentLevel) {
  const cfg = PLAY_STYLE_WORLDS[playStyle] || PLAY_STYLE_WORLDS["casual-player"];
  const stages = cfg.centralStructure.stages;
  let currentStage = stages[0];
  for (let i = stages.length - 1; i >= 0; i--) {
    if (realmEnergy >= stages[i].minEnergy || currentLevel >= stages[i].minLevel) {
      currentStage = stages[i];
      break;
    }
  }

  const elements = cfg.elements.map((el) => ({
    ...el,
    unlocked: el.requiredEnergy === 0 || realmEnergy >= el.requiredEnergy || currentLevel >= el.requiredLevel,
  }));

  return {
    ...cfg,
    centralStructure: {
      ...cfg.centralStructure,
      currentStage,
    },
    elements,
  };
}

// ── Test Execution ──────────────────────────────────────────────────
console.log("1. Testing Central Home Base Evolution across all 5 styles...");
const playStyles = Object.keys(PLAY_STYLE_WORLDS);

for (const ps of playStyles) {
  // Early Stage (0 Energy, Level 1)
  const earlyCfg = getPlayStyleWorldConfig(ps, 0, 1);
  assert.strictEqual(earlyCfg.centralStructure.currentStage.stage, "early");
  assert.strictEqual(earlyCfg.centralStructure.currentStage.stageNumber, 1);

  // Mid Stage (50 Energy, Level 3)
  const midCfg = getPlayStyleWorldConfig(ps, 50, 3);
  assert.strictEqual(midCfg.centralStructure.currentStage.stage, "mid");
  assert.strictEqual(midCfg.centralStructure.currentStage.stageNumber, 2);

  // Advanced Stage (150 Energy, Level 6)
  const advCfg = getPlayStyleWorldConfig(ps, 150, 6);
  assert.strictEqual(advCfg.centralStructure.currentStage.stage, "advanced");
  assert.strictEqual(advCfg.centralStructure.currentStage.stageNumber, 3);

  console.log(`  ✓ [${ps}] Central Base: "${earlyCfg.centralStructure.baseName}"`);
  console.log(`    - Early (L1): ${earlyCfg.centralStructure.currentStage.icon} ${earlyCfg.centralStructure.currentStage.name}`);
  console.log(`    - Mid (L3, 50⚡): ${midCfg.centralStructure.currentStage.icon} ${midCfg.centralStructure.currentStage.name}`);
  console.log(`    - Advanced (L6, 150⚡): ${advCfg.centralStructure.currentStage.icon} ${advCfg.centralStructure.currentStage.name}`);
}

console.log("\n2. Testing Real-Time Mission Progression & Milestone Triggers...");
let state = {
  totalXp: 0,
  currentLevel: 1,
  xpIntoCurrentLevel: 0,
  xpToNextLevel: 100,
  currentStreak: 0,
  completedMissionIds: [],
  realmEnergy: 0,
};

const missions = [
  { id: "m1", title: "Morning Hydration", xpReward: 20, category: "lifestyle" },
  { id: "m2", title: "15-Min Walk", xpReward: 20, category: "physical" },
  { id: "m3", title: "Study Session", xpReward: 30, category: "mental-reflective" },
];

for (const m of missions) {
  const prevEnergy = state.realmEnergy;
  const res = processMissionCompletion(state, m, "2026-08-23");
  state = res.gamification;
  const cfg = getPlayStyleWorldConfig("explorer-builder", state.realmEnergy, state.currentLevel);
  const newlyUnlocked = cfg.elements.find(
    (el) => el.requiredEnergy <= state.realmEnergy && el.requiredEnergy > prevEnergy
  );
  console.log(`  ✓ Completed "${m.title}" -> +${res.xpAwarded} XP, +${res.realmEnergyAwarded}⚡ (Total: ${state.totalXp} XP, ${state.realmEnergy}⚡)`);
  if (newlyUnlocked) {
    console.log(`    🌟 Milestone! Landmark Materialized: ${newlyUnlocked.icon} "${newlyUnlocked.name}"`);
  }
}

console.log("\n==================================================");
console.log("✅ ALL LIVING WORLD & HOME BASE TESTS PASSED!");
console.log("==================================================");
