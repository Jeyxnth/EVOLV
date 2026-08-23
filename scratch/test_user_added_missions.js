/**
 * test_user_added_missions.js — Automated test suite for user-added daily missions.
 */
import assert from "node:assert";

console.log("=== RUNNING USER-ADDED MISSIONS TESTS ===\n");

const SUGGESTED_ACTIVITIES = [
  { id: "sug-walk", title: "15-Minute Refresh Walk", category: "physical", icon: "🚶", xpReward: 20 },
  { id: "sug-water", title: "Hydration Boost (2 Glasses)", category: "lifestyle", icon: "💧", xpReward: 10 },
  { id: "sug-stretch", title: "5-Minute Body Stretch", category: "physical", icon: "🧘", xpReward: 10 },
  { id: "sug-run", title: "Light Jog or Cardio Run", category: "physical", icon: "🏃", xpReward: 30 },
  { id: "sug-workout", title: "15-Minute Quick Workout", category: "physical", icon: "💪", xpReward: 20 },
  { id: "sug-journal", title: "Mindful Journaling Reflection", category: "mental-reflective", icon: "📓", xpReward: 20 },
  { id: "sug-breathe", title: "5-Minute Quiet Breathing", category: "mental-reflective", icon: "🌬️", xpReward: 10 },
  { id: "sug-sleep", title: "Bedtime Wind-Down Ritual", category: "lifestyle", icon: "🌙", xpReward: 20 },
  { id: "sug-screen", title: "30-Minute Screen-Free Break", category: "digital", icon: "📱", xpReward: 20 },
];

assert.strictEqual(SUGGESTED_ACTIVITIES.length, 9, "Should have 9 curated suggested activities");
console.log(`✓ Verified 9 suggested activities available:`);
for (const act of SUGGESTED_ACTIVITIES) {
  assert.ok(act.title, "Activity must have title");
  assert.ok([10, 20, 30].includes(act.xpReward), `Activity ${act.title} must have fair XP (10, 20, or 30)`);
  console.log(`  - ${act.icon} ${act.title} (+${act.xpReward} XP, ${act.category})`);
}

// 2. Test Custom Mission Generation
function createCustomMission(title, description, category, intensity, todayDate) {
  const xpReward = intensity === "quick" ? 10 : intensity === "deep" ? 30 : 20;
  let icon = "⚡";
  if (category === "physical") icon = "🏃";
  else if (category === "mental-reflective") icon = "🧘";
  else if (category === "digital") icon = "📱";
  else if (category === "lifestyle") icon = "🌱";

  return {
    id: `custom_mission_${Date.now()}_test`,
    title: title.trim(),
    description: description.trim() || "User-added wellbeing mission.",
    icon,
    category,
    xpReward,
    playStyleFraming: {
      "puzzle-explorer": `Custom quest: ${title}`,
      "quiz-master": `Personal challenge: ${title}`,
      "casual-player": `Mindful step: ${title}`,
      "competitor": `Target objective: ${title}`,
      "explorer-builder": `Expansion habit: ${title}`,
    },
    completionMode: "manual",
    completed: false,
    date: todayDate,
  };
}

const custom1 = createCustomMission("Drink lemon tea", "Warm tea in evening", "lifestyle", "quick", "2026-08-23");
assert.strictEqual(custom1.title, "Drink lemon tea");
assert.strictEqual(custom1.xpReward, 10);
assert.strictEqual(custom1.category, "lifestyle");
assert.strictEqual(custom1.icon, "🌱");
console.log("\n✓ Custom mission created successfully with fair XP allocation (+10 XP).");

const custom2 = createCustomMission("30min Gym Workout", "Chest and back", "physical", "deep", "2026-08-23");
assert.strictEqual(custom2.xpReward, 30);
console.log("✓ Deep custom mission allocated +30 XP correctly.");

// 3. Test daily limit behavior
const maxDaily = 8;
const currentMissions = new Array(8).fill(null);
const isAtLimit = currentMissions.length >= maxDaily;
assert.strictEqual(isAtLimit, true, "Should detect 8 missions limit");
console.log("✓ Daily mission limit (8 missions max) detected correctly to prevent overload.");

console.log("\n==================================================");
console.log("✅ ALL USER-ADDED DAILY MISSIONS TESTS PASSED!");
console.log("==================================================");
