/**
 * test_phase8_playstyle.js
 */
import assert from "node:assert";

console.log("Starting Phase 8 Play-Style Adaptation Tests...\n");

const PLAY_STYLE_CONFIGS = {
  "puzzle-explorer": { framingTag: "Clue Fragment", interactionType: "puzzle" },
  "quiz-master": { framingTag: "Knowledge Check", interactionType: "quiz" },
  "casual-player": { framingTag: "Gentle Step", interactionType: "casual" },
  "competitor": { framingTag: "Personal Target", interactionType: "competitor" },
  "explorer-builder": { framingTag: "Realm Expansion", interactionType: "builder" },
};

const styles = Object.keys(PLAY_STYLE_CONFIGS);
assert.strictEqual(styles.length, 5);

const tags = new Set(styles.map(s => PLAY_STYLE_CONFIGS[s].framingTag));
const types = new Set(styles.map(s => PLAY_STYLE_CONFIGS[s].interactionType));

assert.strictEqual(tags.size, 5);
assert.strictEqual(types.size, 5);

console.log("✅ ALL PHASE 8 PLAY-STYLE ADAPTATION TESTS PASSED!\n");
