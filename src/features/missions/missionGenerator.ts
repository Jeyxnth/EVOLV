/**
 * missionGenerator.ts — deterministic, rule-based mission & journey generator.
 *
 * Generates personalized daily missions and weekly journeys based on:
 *  - Player priority (mental / physical / balanced)
 *  - Play style (framing text & quest style)
 *  - Selected goals (sleep, activity, stress, etc.)
 *  - PlayerAIContext (extracted struggles, activity level, sleep pattern)
 */
import type {
  Mission,
  MissionCategory,
  WeeklyJourney,
  WellbeingPriority,
  PlayStyle,
  Goal,
  PlayerAIContext,
} from "../../types";

/* ── Helpers ──────────────────────────────────────────────────────── */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: format(monday),
    endDate: format(sunday),
  };
}

/* ── Weekly Journey Generation ────────────────────────────────────── */

export function generateWeeklyJourney(
  priority: WellbeingPriority,
  playStyle: PlayStyle,
  goals: Goal[],
  playerContext: PlayerAIContext | null,
): WeeklyJourney {
  const { startDate, endDate } = getWeekDateRange();

  let theme = "Foundations of Balance";
  let focus = "Building steady daily rhythm and mental clarity";
  let description =
    "Your journey this week introduces small, manageable daily habits tailored to your schedule and goals.";

  const hasSleepGoal = goals.some((g) => g.category === "sleep" || g.label.toLowerCase().includes("sleep"));
  const hasStressGoal = goals.some((g) => g.category === "stress-management" || g.label.toLowerCase().includes("stress"));
  const hasPhysicalGoal = goals.some((g) => g.category === "physical-activity" || g.label.toLowerCase().includes("active"));

  if (priority === "mental" || hasStressGoal) {
    theme = "Calm Horizons & Mental Space";
    focus = "Decompressing academic pressure and creating mindful pauses";
    description =
      "This week focuses on reducing cognitive fatigue, taking intentional breaks between study blocks, and winding down at night.";
  } else if (priority === "physical" || hasPhysicalGoal) {
    theme = "Awakening Energy & Movement";
    focus = "Integrating gentle, consistent physical movement";
    description =
      "This week focuses on activating your body, boosting your daily energy reserves, and building steady activity habits.";
  } else if (hasSleepGoal || playerContext?.sleepPattern === "irregular" || playerContext?.sleepPattern === "late") {
    theme = "Rest, Recharge & Recovery";
    focus = "Restoring nighttime rest and evening decompression";
    description =
      "This week focuses on establishing an enjoyable wind-down routine and improving sleep consistency.";
  }

  return {
    id: `journey_w1_${Date.now()}`,
    weekNumber: 1,
    theme,
    focus,
    description,
    startDate,
    endDate,
    priority,
    playStyle,
    completedDays: [],
    createdAt: new Date().toISOString(),
  };
}

/* ── Daily Mission Generation ─────────────────────────────────────── */

interface MissionTemplate {
  title: string;
  description: string;
  icon: string;
  category: MissionCategory;
  xpReward: number;
  playStyleFraming: Record<PlayStyle, string>;
  tags: string[];
}

const MISSION_POOL: MissionTemplate[] = [
  // ── Physical ──
  {
    title: "10-Minute Morning Walk",
    description: "Step outside for fresh air and gentle movement to start your day.",
    icon: "🚶",
    category: "physical",
    xpReward: 25,
    tags: ["physical-activity", "energy"],
    playStyleFraming: {
      "puzzle-explorer": "Uncover the morning path — 10 minutes of outdoor exploration.",
      "quiz-master": "Observation quest: notice 3 distinct sights along your walk.",
      "casual-player": "A gentle 10-minute stroll to wake up your body.",
      "competitor": "Sprint past inertia: log your first 10 minutes of morning movement.",
      "explorer-builder": "Scout the neighborhood: add fresh steps to expand your territory.",
    },
  },
  {
    title: "Midday Stretch & Posture Reset",
    description: "Spend 5 minutes stretching your neck, back, and shoulders.",
    icon: "🧘",
    category: "physical",
    xpReward: 20,
    tags: ["physical-activity", "stress-management"],
    playStyleFraming: {
      "puzzle-explorer": "Align your posture mechanics to unlock energy flow.",
      "quiz-master": "Ergonomics challenge: 5 mindful minutes of upper body release.",
      "casual-player": "A soft 5-minute stretch to loosen up between tasks.",
      "competitor": "Reset your biomechanics for peak afternoon focus.",
      "explorer-builder": "Reinforce your physical foundation with a mobility reset.",
    },
  },
  {
    title: "Hydration Checkpoint",
    description: "Drink a large glass of water before starting your next activity.",
    icon: "💧",
    category: "lifestyle",
    xpReward: 15,
    tags: ["lifestyle", "water"],
    playStyleFraming: {
      "puzzle-explorer": "Replenish your internal elixir reserves.",
      "quiz-master": "Hydration fact check: fuel brain function with fresh water.",
      "casual-player": "Grab a refreshing glass of water and take a slow sip.",
      "competitor": "Power-up boost: hydrate to maintain high cognitive stamina.",
      "explorer-builder": "Supply drop: nourish your avatar with essential hydration.",
    },
  },

  // ── Mental & Reflective ──
  {
    title: "3 Things You're Grateful For",
    description: "Write down or mentally note 3 small wins or pleasant moments today.",
    icon: "📓",
    category: "mental-reflective",
    xpReward: 25,
    tags: ["stress-management", "mindfulness"],
    playStyleFraming: {
      "puzzle-explorer": "Decipher the hidden positives scattered across your day.",
      "quiz-master": "Reflective inquiry: document 3 genuine highlights.",
      "casual-player": "Take a cozy moment to think of 3 things that made you smile.",
      "competitor": "Mental review: capture 3 key wins from today.",
      "explorer-builder": "Collect 3 gratitude gems to brighten your world.",
    },
  },
  {
    title: "Mindful Pause (2 Minutes)",
    description: "Close your eyes, breathe deeply, and let go of muscle tension.",
    icon: "🌬️",
    category: "mental-reflective",
    xpReward: 20,
    tags: ["stress-management", "academic-balance"],
    playStyleFraming: {
      "puzzle-explorer": "Enter the quiet chamber: 2 minutes of silent recalibration.",
      "quiz-master": "Focus test: anchor your attention solely on your breath for 120s.",
      "casual-player": "A peaceful 2-minute breather to soften any heavy thoughts.",
      "competitor": "Tactical timeout: lower your heart rate and regain sharp composure.",
      "explorer-builder": "Construct a sanctuary of calm within your mind.",
    },
  },

  // ── Digital & Sleep ──
  {
    title: "Nighttime Screen Curfew",
    description: "Put away phone and laptop screens 30 minutes before sleep.",
    icon: "🌙",
    category: "digital",
    xpReward: 30,
    tags: ["sleep", "screen-time"],
    playStyleFraming: {
      "puzzle-explorer": "Initiate blackout mode: disconnect screens to trigger deep recovery.",
      "quiz-master": "Circadian trial: eliminate blue light 30 minutes before sleep.",
      "casual-player": "Dim the lights and let your mind unwind without notification buzzes.",
      "competitor": "Elite sleep discipline: 30-minute screen cut-off for optimal REM sleep.",
      "explorer-builder": "Power down the digital portal and prepare the sleep sanctuary.",
    },
  },
  {
    title: "Single-Tasking Focus Block",
    description: "Work on one academic or creative task for 25 minutes without tab-switching.",
    icon: "🎯",
    category: "mental-reflective",
    xpReward: 30,
    tags: ["academic-balance", "screen-time"],
    playStyleFraming: {
      "puzzle-explorer": "Laser focus trial: solve a single puzzle without distraction.",
      "quiz-master": "Mastery sprint: 25 minutes of deep undivided attention.",
      "casual-player": "Pick one task, take it easy, and enjoy doing it step by step.",
      "competitor": "High-intensity focus round: 25 minutes of zero tab switches.",
      "explorer-builder": "Craft an undisturbed milestone in your study blueprint.",
    },
  },
];

export function generateDailyMissions(
  priority: WellbeingPriority,
  _playStyle: PlayStyle,
  _goals: Goal[],
  _playerContext: PlayerAIContext | null,
  date: string = getTodayDateString(),
): Mission[] {
  // Always generate 3 distinct missions:
  // 1 Physical/Movement, 1 Mental/Reflective, 1 Digital/Sleep/Lifestyle

  const physicalPool = MISSION_POOL.filter((m) => m.category === "physical");
  const mentalPool = MISSION_POOL.filter((m) => m.category === "mental-reflective");
  const digitalLifestylePool = MISSION_POOL.filter((m) => m.category === "digital" || m.category === "lifestyle");

  // Pick deterministic index based on date string so it doesn't change on re-render within same day
  const dateHash = date.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const m1Template = physicalPool[dateHash % physicalPool.length];
  const m2Template = mentalPool[dateHash % mentalPool.length];
  const m3Template = digitalLifestylePool[dateHash % digitalLifestylePool.length];

  const selectedTemplates = [m1Template, m2Template, m3Template];

  // If priority is mental, put mental mission first; if physical, put physical first
  if (priority === "mental") {
    selectedTemplates.reverse();
  }

  return selectedTemplates.map((t, idx) => ({
    id: `mission_${date}_${idx + 1}`,
    title: t.title,
    description: t.description,
    icon: t.icon,
    category: t.category,
    playStyleFraming: t.playStyleFraming,
    xpReward: t.xpReward,
    completionMode: "manual",
    completed: false,
    date,
  }));
}
