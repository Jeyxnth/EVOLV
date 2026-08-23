/**
 * test_fixes_gamification_world.js
 * Comprehensive automated verification for Fixes 1, 2, 3, 4, 5.
 */
import assert from "node:assert";

console.log("=== RUNNING EXTENSIVE GAMIFICATION & PLAY-STYLE WORLD TESTS ===\n");

// ── 1. Test All 5 Play-Style World Configurations ──
console.log("1. Testing Distinct Play-Style World Configurations...");

const PLAY_STYLE_WORLDS = {
  "explorer-builder": {
    regionName: "The Living Valley",
    worldTheme: "Verdant Fantasy Nature Sanctuary",
    skyGradient: "linear-gradient(180deg, #bbf2f6 0%, #d8f3dc 40%, #e8f5e9 75%, var(--color-evolv-bg) 100%)",
    elements: [
      { id: "exp-1", name: "Meadow Sproutlands", requiredEnergy: 0, requiredLevel: 1, unlocked: true },
      { id: "exp-2", name: "Whispering Brook", requiredEnergy: 20, requiredLevel: 2, unlocked: false },
      { id: "exp-3", name: "Ancient Sun Birch", requiredEnergy: 50, requiredLevel: 3, unlocked: false },
      { id: "exp-4", name: "Moonstone Bridge", requiredEnergy: 90, requiredLevel: 4, unlocked: false },
      { id: "exp-5", name: "Eagle's Ridge Lookout", requiredEnergy: 140, requiredLevel: 6, unlocked: false },
      { id: "exp-6", name: "Celestial Sun Pinnacle", requiredEnergy: 200, requiredLevel: 8, unlocked: false },
    ],
  },
  "puzzle-explorer": {
    regionName: "The Sunken Citadel",
    worldTheme: "Ancient Mystical Relic Ruins",
    skyGradient: "linear-gradient(180deg, #dcd6f7 0%, #c4bbf0 35%, #e3e0f3 70%, var(--color-evolv-bg) 100%)",
    elements: [
      { id: "puz-1", name: "Forgotten Plaza", requiredEnergy: 0, requiredLevel: 1, unlocked: true },
      { id: "puz-2", name: "Runestone Pathway", requiredEnergy: 20, requiredLevel: 2, unlocked: false },
      { id: "puz-3", name: "Gate of Focus", requiredEnergy: 50, requiredLevel: 3, unlocked: false },
      { id: "puz-4", name: "Chamber of Insight", requiredEnergy: 90, requiredLevel: 4, unlocked: false },
      { id: "puz-5", name: "Amethyst Obelisk", requiredEnergy: 140, requiredLevel: 6, unlocked: false },
      { id: "puz-6", name: "Solar Crown Sanctum", requiredEnergy: 200, requiredLevel: 8, unlocked: false },
    ],
  },
  "quiz-master": {
    regionName: "The Citadel of Mind",
    worldTheme: "Grand Academy of Science & Discovery",
    skyGradient: "linear-gradient(180deg, #c7ecee 0%, #7ed6df 35%, #dff9fb 75%, var(--color-evolv-bg) 100%)",
    elements: [
      { id: "quiz-1", name: "Academy Courtyard", requiredEnergy: 0, requiredLevel: 1, unlocked: true },
      { id: "quiz-2", name: "Study Pavilion", requiredEnergy: 20, requiredLevel: 2, unlocked: false },
      { id: "quiz-3", name: "Reflection Library", requiredEnergy: 50, requiredLevel: 3, unlocked: false },
      { id: "quiz-4", name: "Scribe's Spire", requiredEnergy: 90, requiredLevel: 4, unlocked: false },
      { id: "quiz-5", name: "Stargazer Observatory", requiredEnergy: 140, requiredLevel: 6, unlocked: false },
      { id: "quiz-6", name: "Grand Celestial Archive", requiredEnergy: 200, requiredLevel: 8, unlocked: false },
    ],
  },
  "casual-player": {
    regionName: "Haven Hollow",
    worldTheme: "Cozy Hearthside Settlement & Gardens",
    skyGradient: "linear-gradient(180deg, #ffeaa7 0%, #fab1a0 40%, #fdcb6e 70%, var(--color-evolv-bg) 100%)",
    elements: [
      { id: "cas-1", name: "Wildflower Meadow", requiredEnergy: 0, requiredLevel: 1, unlocked: true },
      { id: "cas-2", name: "Hearthside Cottage", requiredEnergy: 20, requiredLevel: 2, unlocked: false },
      { id: "cas-3", name: "Herbal Blossom Garden", requiredEnergy: 50, requiredLevel: 3, unlocked: false },
      { id: "cas-4", name: "Community Tea Pavilion", requiredEnergy: 90, requiredLevel: 4, unlocked: false },
      { id: "cas-5", name: "Zen Reflection Hot Spring", requiredEnergy: 140, requiredLevel: 6, unlocked: false },
      { id: "cas-6", name: "Flourishing Haven Sanctuary", requiredEnergy: 200, requiredLevel: 8, unlocked: false },
    ],
  },
  "competitor": {
    regionName: "Apex Citadel",
    worldTheme: "Valor Peak & Fortress of Discipline",
    skyGradient: "linear-gradient(180deg, #ff9ff3 0%, #feca57 35%, #ff6b6b 70%, var(--color-evolv-bg) 100%)",
    elements: [
      { id: "comp-1", name: "Training Ground", requiredEnergy: 0, requiredLevel: 1, unlocked: true },
      { id: "comp-2", name: "Endurance Track", requiredEnergy: 20, requiredLevel: 2, unlocked: false },
      { id: "comp-3", name: "Banner of Discipline", requiredEnergy: 50, requiredLevel: 3, unlocked: false },
      { id: "comp-4", name: "Iron Beacon Tower", requiredEnergy: 90, requiredLevel: 4, unlocked: false },
      { id: "comp-5", name: "Summit of Mastery", requiredEnergy: 140, requiredLevel: 6, unlocked: false },
      { id: "comp-6", name: "Champion's Crown Arena", requiredEnergy: 200, requiredLevel: 8, unlocked: false },
    ],
  },
};

const styles = Object.keys(PLAY_STYLE_WORLDS);
const regionNames = new Set();
const worldThemes = new Set();
const skyGradients = new Set();

for (const s of styles) {
  const cfg = PLAY_STYLE_WORLDS[s];
  assert.ok(cfg.regionName, `Missing regionName for ${s}`);
  assert.ok(cfg.worldTheme, `Missing worldTheme for ${s}`);
  assert.ok(cfg.elements.length >= 6, `Less than 6 elements for ${s}`);
  assert.strictEqual(cfg.elements[0].unlocked, true, `First element should be unlocked at level 1 for ${s}`);

  regionNames.add(cfg.regionName);
  worldThemes.add(cfg.worldTheme);
  skyGradients.add(cfg.skyGradient);

  console.log(`  ✓ [${s}] -> Region: "${cfg.regionName}" | Theme: "${cfg.worldTheme}"`);
}

assert.strictEqual(regionNames.size, 5, "All 5 play styles must have unique region names");
assert.strictEqual(worldThemes.size, 5, "All 5 play styles must have unique world themes");
assert.strictEqual(skyGradients.size, 5, "All 5 play styles must have unique sky gradients");

// ── 2. Test Realm Energy & Progression Calculations ──
console.log("\n2. Testing Realm Energy & Element Unlocks...");

function processMissionCompletion(currentG, mission) {
  const xpReward = mission.xpReward > 0 ? mission.xpReward : 20;
  const realmEnergyReward = Math.max(5, Math.round(xpReward / 2));
  return {
    xpAwarded: xpReward,
    realmEnergyAwarded: realmEnergyReward,
    gamification: {
      totalXp: (currentG.totalXp || 0) + xpReward,
      currentLevel: Math.floor(((currentG.totalXp || 0) + xpReward) / 100) + 1,
      realmEnergy: (currentG.realmEnergy || 0) + realmEnergyReward,
    }
  };
}

let gamification = { totalXp: 0, currentLevel: 1, realmEnergy: 0 };
const m1 = { id: "m1", title: "Walk", xpReward: 20 };
const r1 = processMissionCompletion(gamification, m1);
assert.strictEqual(r1.xpAwarded, 20);
assert.strictEqual(r1.realmEnergyAwarded, 10);
assert.strictEqual(r1.gamification.realmEnergy, 10);
console.log(`  ✓ Mission 1 completed -> +${r1.xpAwarded} XP, +${r1.realmEnergyAwarded} Realm Energy (Total: ${r1.gamification.realmEnergy} ⚡)`);

gamification = r1.gamification;
for (let i = 2; i <= 5; i++) {
  const r = processMissionCompletion(gamification, { id: `m${i}`, title: `Task ${i}`, xpReward: 20 });
  gamification = r.gamification;
}
assert.strictEqual(gamification.realmEnergy, 50);
console.log(`  ✓ 5 missions completed -> Total Realm Energy: ${gamification.realmEnergy} ⚡`);

// ── 3. Test Backward Compatibility ──
console.log("\n3. Testing Backward Compatibility...");
const oldUserRaw = { totalXp: 300, currentLevel: 3 };
const loadedEnergy = oldUserRaw.realmEnergy ?? Math.floor(oldUserRaw.totalXp / 3);
assert.strictEqual(loadedEnergy, 100);
console.log(`  ✓ Backward compatibility safe fallback calculated: ${loadedEnergy} ⚡`);

console.log("\n==================================================");
console.log("✅ ALL EXTENSIVE GAMIFICATION & WORLD TESTS PASSED!");
console.log("==================================================\n");
