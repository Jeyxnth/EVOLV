/**
 * db.ts — Firestore + demo persistence service.
 *
 * Persists:
 *  - Onboarding profile (priority, playStyle, onboardingCompleted)
 *  - Goals (`users/{uid}/goals/{goalId}`)
 *  - PlayerAIContext (`users/{uid}/playerContext/v1`)
 *  - WeeklyJourney (`users/{uid}/journey/current`)
 *  - Daily Missions (`users/{uid}/missions/{missionId}`)
 *
 * In Demo mode, all of the above is backed by sessionStorage keys so the entire
 * app works offline and without Firebase credentials.
 */
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Goal,
  WellbeingPriority,
  PlayStyle,
  PlayerAIContext,
  WeeklyJourney,
  Mission,
  DailyActivity,
  ActivityTargets,
  GamificationData,
} from "../types";
import {
  createInitialGamificationData,
  calculateXPProgress,
  processMissionCompletion,
  type MissionCompletionResult,
} from "../features/xp/gamificationEngine";

/* ── Storage Keys for Demo Mode ───────────────────────────────────── */

const DEMO_ONBOARDING_KEY = "evolv_demo_onboarding";
const DEMO_JOURNEY_KEY = "evolv_demo_journey";
const DEMO_MISSIONS_KEY = "evolv_demo_missions";
const DEMO_ACTIVITY_KEY_PREFIX = "evolv_demo_activity_"; // + date
const DEMO_TARGETS_KEY = "evolv_demo_targets";
const DEMO_GAMIFICATION_KEY = "evolv_demo_gamification";

interface DemoOnboardingData {
  goals: Goal[];
  priority: WellbeingPriority | null;
  playStyle: PlayStyle | null;
  onboardingCompleted: boolean;
  playerContext?: PlayerAIContext | null;
}

function loadDemoOnboarding(): DemoOnboardingData {
  try {
    const raw = sessionStorage.getItem(DEMO_ONBOARDING_KEY);
    if (raw) return JSON.parse(raw) as DemoOnboardingData;
  } catch { /* ignore */ }
  return { goals: [], priority: null, playStyle: null, onboardingCompleted: false };
}

function saveDemoOnboarding(data: Partial<DemoOnboardingData>): void {
  try {
    const existing = loadDemoOnboarding();
    sessionStorage.setItem(
      DEMO_ONBOARDING_KEY,
      JSON.stringify({ ...existing, ...data }),
    );
  } catch { /* ignore */ }
}

/* ── Save onboarding profile fields ──────────────────────────────── */

export async function saveOnboardingProfile(
  uid: string,
  isDemo: boolean,
  data: {
    displayName: string;
    priority: WellbeingPriority;
    playStyle: PlayStyle;
  },
): Promise<void> {
  if (isDemo) {
    saveDemoOnboarding({
      priority: data.priority,
      playStyle: data.playStyle,
      onboardingCompleted: true,
    });
    return;
  }
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      displayName: data.displayName,
      priority: data.priority,
      playStyle: data.playStyle,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/* ── Save goals ───────────────────────────────────────────────────── */

export async function saveGoals(
  uid: string,
  isDemo: boolean,
  goals: Goal[],
): Promise<void> {
  if (isDemo) {
    saveDemoOnboarding({ goals });
    return;
  }
  if (!db) return;

  for (const goal of goals) {
    const ref = doc(db, "users", uid, "goals", goal.id);
    await setDoc(ref, goal);
  }
}

/* ── Load onboarding data ─────────────────────────────────────────── */

export async function loadOnboardingData(
  uid: string,
  isDemo: boolean,
): Promise<DemoOnboardingData> {
  if (isDemo) {
    return loadDemoOnboarding();
  }
  if (!db) {
    return { goals: [], priority: null, playStyle: null, onboardingCompleted: false };
  }

  try {
    const profileSnap = await getDoc(doc(db, "users", uid));
    const profile = profileSnap.exists() ? profileSnap.data() : {};

    const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
    const goals = goalsSnap.docs.map((d) => d.data() as Goal);

    let playerContext: PlayerAIContext | null = null;
    try {
      const ctxSnap = await getDoc(doc(db, "users", uid, "playerContext", "v1"));
      if (ctxSnap.exists()) {
        playerContext = ctxSnap.data() as PlayerAIContext;
      }
    } catch { /* ignore */ }

    return {
      goals,
      priority: (profile.priority as WellbeingPriority) ?? null,
      playStyle: (profile.playStyle as PlayStyle) ?? null,
      onboardingCompleted: Boolean(profile.onboardingCompleted),
      playerContext,
    };
  } catch (err) {
    console.error("[db] Error loading onboarding data:", err);
    return { goals: [], priority: null, playStyle: null, onboardingCompleted: false };
  }
}

/** Mark onboarding as complete in Firestore or Demo storage */
export async function markOnboardingComplete(
  uid: string,
  isDemo: boolean,
): Promise<void> {
  if (isDemo) {
    saveDemoOnboarding({ onboardingCompleted: true });
    return;
  }
  if (!db) return;
  await setDoc(
    doc(db, "users", uid),
    { onboardingCompleted: true, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/** Delete a single goal */
export async function deleteGoal(
  uid: string,
  isDemo: boolean,
  goalId: string,
): Promise<void> {
  if (isDemo) {
    const data = loadDemoOnboarding();
    saveDemoOnboarding({ goals: data.goals.filter((g) => g.id !== goalId) });
    return;
  }
  if (!db) return;
  await deleteDoc(doc(db, "users", uid, "goals", goalId));
}

/** Save the AI-extracted PlayerAIContext */
export async function savePlayerContext(
  uid: string,
  isDemo: boolean,
  context: PlayerAIContext,
): Promise<void> {
  if (isDemo) {
    saveDemoOnboarding({ playerContext: context });
    return;
  }
  if (!db) return;
  await setDoc(
    doc(db, "users", uid, "playerContext", "v1"),
    { ...context },
    { merge: false },
  );
}

/* ── Weekly Journey Persistence ───────────────────────────────────── */

export async function saveWeeklyJourney(
  uid: string,
  isDemo: boolean,
  journey: WeeklyJourney,
): Promise<void> {
  if (isDemo) {
    try {
      sessionStorage.setItem(DEMO_JOURNEY_KEY, JSON.stringify(journey));
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;
  await setDoc(doc(db, "users", uid, "journey", "current"), journey, { merge: true });
}

export async function loadWeeklyJourney(
  uid: string,
  isDemo: boolean,
): Promise<WeeklyJourney | null> {
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_JOURNEY_KEY);
      if (raw) return JSON.parse(raw) as WeeklyJourney;
    } catch { /* ignore */ }
    return null;
  }
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "journey", "current"));
    if (snap.exists()) {
      return snap.data() as WeeklyJourney;
    }
  } catch (err) {
    console.error("[db] Error loading weekly journey:", err);
  }
  return null;
}

/* ── Daily Missions Persistence ───────────────────────────────────── */

export async function saveDailyMissions(
  uid: string,
  isDemo: boolean,
  missions: Mission[],
): Promise<void> {
  if (isDemo) {
    try {
      const existingRaw = sessionStorage.getItem(DEMO_MISSIONS_KEY);
      const existing: Mission[] = existingRaw ? JSON.parse(existingRaw) : [];
      // Replace missions with matching IDs or add new ones
      const existingMap = new Map(existing.map((m) => [m.id, m]));
      for (const m of missions) {
        existingMap.set(m.id, m);
      }
      sessionStorage.setItem(
        DEMO_MISSIONS_KEY,
        JSON.stringify(Array.from(existingMap.values())),
      );
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;

  for (const mission of missions) {
    await setDoc(doc(db, "users", uid, "missions", mission.id), mission, { merge: true });
  }
}

export async function loadDailyMissions(
  uid: string,
  isDemo: boolean,
  date: string,
): Promise<Mission[]> {
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_MISSIONS_KEY);
      if (raw) {
        const all: Mission[] = JSON.parse(raw);
        return all.filter((m) => m.date === date);
      }
    } catch { /* ignore */ }
    return [];
  }
  if (!db) return [];

  try {
    const q = query(collection(db, "users", uid, "missions"), where("date", "==", date));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Mission);
  } catch (err) {
    console.error("[db] Error loading daily missions:", err);
    return [];
  }
}

export async function loadWeeklyMissions(
  uid: string,
  isDemo: boolean,
  dates: string[],
): Promise<Mission[]> {
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_MISSIONS_KEY);
      if (raw) {
        const all: Mission[] = JSON.parse(raw);
        const dateSet = new Set(dates);
        return all.filter((m) => dateSet.has(m.date));
      }
    } catch { /* ignore */ }
    return [];
  }
  if (!db) return [];
  try {
    const q = query(
      collection(db, "users", uid, "missions"),
      where("date", "in", dates.slice(0, 10)),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Mission);
  } catch (err) {
    console.error("[db] Error loading weekly missions:", err);
    return [];
  }
}

export async function toggleMissionCompleted(
  uid: string,
  isDemo: boolean,
  missionId: string,
  completed: boolean,
): Promise<void> {
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_MISSIONS_KEY);
      if (raw) {
        const all: Mission[] = JSON.parse(raw);
        const updated = all.map((m) => (m.id === missionId ? { ...m, completed } : m));
        sessionStorage.setItem(DEMO_MISSIONS_KEY, JSON.stringify(updated));
      }
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid, "missions", missionId),
      { completed },
      { merge: true },
    );
  } catch (err) {
    console.error("[db] Error toggling mission completed:", err);
  }
}

/* ── Daily Activity Persistence ───────────────────────────────────── */

export async function saveDailyActivity(
  uid: string,
  isDemo: boolean,
  activity: DailyActivity,
): Promise<void> {
  if (isDemo) {
    try {
      sessionStorage.setItem(
        DEMO_ACTIVITY_KEY_PREFIX + activity.date,
        JSON.stringify(activity),
      );
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid, "activity", activity.date),
      activity,
      { merge: true },
    );
  } catch (err) {
    console.error("[db] Error saving daily activity:", err);
  }
}

export async function loadDailyActivity(
  uid: string,
  isDemo: boolean,
  date: string,
): Promise<DailyActivity | null> {
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_ACTIVITY_KEY_PREFIX + date);
      if (raw) return JSON.parse(raw) as DailyActivity;
    } catch { /* ignore */ }
    return null;
  }
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "activity", date));
    if (snap.exists()) return snap.data() as DailyActivity;
  } catch (err) {
    console.error("[db] Error loading daily activity:", err);
  }
  return null;
}

/**
 * Load activity records for an array of dates.
 * Used by ProgressPage to build the weekly chart.
 * Returns only dates that have data — caller fills gaps with zeros.
 */
export async function loadWeeklyActivity(
  uid: string,
  isDemo: boolean,
  dates: string[],
): Promise<DailyActivity[]> {
  const results: DailyActivity[] = [];
  for (const date of dates) {
    const activity = await loadDailyActivity(uid, isDemo, date);
    if (activity) results.push(activity);
  }
  return results;
}

/* ── Activity Targets Persistence ─────────────────────────────────── */

/**
 * Build starter targets from PlayerAIContext when available.
 * Logic: if the AI context signals a known low baseline, set a gentle
 * improvement target rather than an idealistic universal default.
 */
export function buildDefaultTargets(playerContext: PlayerAIContext | null): ActivityTargets {
  const now = new Date().toISOString();

  // Baseline: gentle starter defaults suitable for a busy student
  let sleepHours = 7;
  let screenTimeHours = 4;
  let waterGlasses = 6;
  let steps = 5000;
  let walkingMinutes = 20;
  let runningMinutes = 15;

  if (playerContext) {
    // If AI detected late sleep pattern → lower initial sleep target
    if (playerContext.sleepPattern === "late" || playerContext.sleepPattern === "irregular") {
      sleepHours = 6;
    }
    // If high screen time pattern → set a realistic reduction target
    if (playerContext.screenTimePattern === "high") {
      screenTimeHours = 5;
    }
    // If low activity level → set gentler movement targets
    if (playerContext.currentActivityLevel === "low") {
      steps = 3500;
      walkingMinutes = 10;
      runningMinutes = 0;
    } else if (playerContext.currentActivityLevel === "medium") {
      steps = 5000;
      walkingMinutes = 20;
      runningMinutes = 10;
    }
  }

  return {
    steps,
    walkingMinutes,
    runningMinutes,
    sleepHours,
    screenTimeHours,
    waterGlasses,
    updatedAt: now,
  };
}

export async function saveActivityTargets(
  uid: string,
  isDemo: boolean,
  targets: ActivityTargets,
): Promise<void> {
  if (isDemo) {
    try {
      sessionStorage.setItem(DEMO_TARGETS_KEY, JSON.stringify(targets));
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid, "activityTargets", "current"),
      targets,
      { merge: false },
    );
  } catch (err) {
    console.error("[db] Error saving activity targets:", err);
  }
}

export async function loadActivityTargets(
  uid: string,
  isDemo: boolean,
  playerContext?: PlayerAIContext | null,
): Promise<ActivityTargets> {
  const fallback = buildDefaultTargets(playerContext ?? null);

  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_TARGETS_KEY);
      if (raw) return JSON.parse(raw) as ActivityTargets;
    } catch { /* ignore */ }
    return fallback;
  }
  if (!db) return fallback;
  try {
    const snap = await getDoc(doc(db, "users", uid, "activityTargets", "current"));
    if (snap.exists()) return snap.data() as ActivityTargets;
  } catch (err) {
    console.error("[db] Error loading activity targets:", err);
  }
  return fallback;
}

/* ── Active Play-Style Persistence ────────────────────────────────── */

export async function saveActivePlayStyle(
  uid: string,
  isDemo: boolean,
  playStyle: PlayStyle,
): Promise<void> {
  if (isDemo) {
    saveDemoOnboarding({ playStyle });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("evolv:playstyle-changed", { detail: playStyle }));
    }
    return;
  }
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid),
      { playStyle, updatedAt: new Date().toISOString() },
      { merge: true },
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("evolv:playstyle-changed", { detail: playStyle }));
    }
  } catch (err) {
    console.error("[db] Error saving active play style:", err);
  }
}

export async function loadActivePlayStyle(
  uid: string,
  isDemo: boolean,
): Promise<PlayStyle> {
  const defaultStyle: PlayStyle = "casual-player";
  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_ONBOARDING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoOnboardingData;
        if (parsed.playStyle) return parsed.playStyle;
      }
    } catch { /* ignore */ }
    return defaultStyle;
  }
  if (!db) return defaultStyle;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.playStyle) return data.playStyle as PlayStyle;
    }
  } catch (err) {
    console.error("[db] Error loading active play style:", err);
  }
  return defaultStyle;
}

/* ── Gamification Engine Persistence (Phase 9) ────────────────────── */

export async function saveGamificationData(
  uid: string,
  isDemo: boolean,
  data: GamificationData,
): Promise<void> {
  if (isDemo) {
    try {
      sessionStorage.setItem(DEMO_GAMIFICATION_KEY, JSON.stringify(data));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("evolv:gamification-updated", { detail: data }));
      }
    } catch { /* ignore */ }
    return;
  }
  if (!db) return;
  try {
    await setDoc(
      doc(db, "users", uid, "gamification", "current"),
      data,
      { merge: true },
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("evolv:gamification-updated", { detail: data }));
    }
  } catch (err) {
    console.error("[db] Error saving gamification data:", err);
  }
}

export async function loadGamificationData(
  uid: string,
  isDemo: boolean,
): Promise<GamificationData> {
  const initial = createInitialGamificationData();

  if (isDemo) {
    try {
      const raw = sessionStorage.getItem(DEMO_GAMIFICATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GamificationData;
        const progress = calculateXPProgress(parsed.totalXp);
        return {
          ...parsed,
          currentLevel: progress.level,
          xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
          xpToNextLevel: progress.xpToNextLevel,
          completedMissionIds: Array.isArray(parsed.completedMissionIds)
            ? parsed.completedMissionIds
            : [],
          realmEnergy: parsed.realmEnergy ?? Math.floor((parsed.totalXp ?? 0) / 3),
          unlockedElementIds: Array.isArray(parsed.unlockedElementIds) ? parsed.unlockedElementIds : [],
        };
      }
    } catch { /* ignore */ }
    return initial;
  }

  if (!db) return initial;
  try {
    const snap = await getDoc(doc(db, "users", uid, "gamification", "current"));
    if (snap.exists()) {
      const data = snap.data() as GamificationData;
      const progress = calculateXPProgress(data.totalXp);
      return {
        ...data,
        currentLevel: progress.level,
        xpIntoCurrentLevel: progress.xpIntoCurrentLevel,
        xpToNextLevel: progress.xpToNextLevel,
        completedMissionIds: Array.isArray(data.completedMissionIds)
          ? data.completedMissionIds
          : [],
        realmEnergy: data.realmEnergy ?? Math.floor((data.totalXp ?? 0) / 3),
        unlockedElementIds: Array.isArray(data.unlockedElementIds) ? data.unlockedElementIds : [],
      };
    }
  } catch (err) {
    console.error("[db] Error loading gamification data:", err);
  }

  return initial;
}

/**
 * High-level atomic mission completion and reward processing.
 * Idempotently awards XP, updates streak, checks level-up, and saves to database.
 */
export async function awardMissionXP(
  uid: string,
  isDemo: boolean,
  mission: Mission,
  todayDate: string,
): Promise<MissionCompletionResult> {
  const current = await loadGamificationData(uid, isDemo);
  const result = processMissionCompletion(current, mission, todayDate);

  if (!result.isDuplicate) {
    await saveGamificationData(uid, isDemo, result.gamification);
  }

  return result;
}


