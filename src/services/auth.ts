/**
 * Auth service — Firebase authentication + demo session management.
 *
 * Phase 3: supports email/password auth and a zero-friction demo mode.
 *
 * Demo mode creates a local-only session that does NOT require Firebase
 * credentials. This ensures hackathon judges can enter the app instantly.
 *
 * When Firebase is configured, real auth uses Firebase Auth SDK.
 * When Firebase is NOT configured, only demo mode is available —
 * the login/signup buttons will show a clear message.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, hasFirebaseConfig } from "./firebase";
import type { PlayerProfile, XPState, StreakState } from "../types";

/* ── Demo session helpers ─────────────────────────────────────────── */

const DEMO_STORAGE_KEY = "evolv_demo_session";

export interface DemoSession {
  uid: string;
  displayName: string;
  isDemo: true;
  createdAt: string;
}

function generateDemoId(): string {
  return "demo_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createDemoSession(): DemoSession {
  const session: DemoSession = {
    uid: generateDemoId(),
    displayName: "Explorer",
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage may be unavailable in some contexts — gracefully continue
  }
  return session;
}

export function loadDemoSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  try {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // no-op
  }
}

/* ── Default profile factory ──────────────────────────────────────── */

const DEFAULT_XP: XPState = {
  totalXp: 0,
  level: 1,
  xpIntoCurrentLevel: 0,
  xpToNextLevel: 100,
};

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  activeDaysInWindow: 0,
  windowSizeDays: 7,
  lastActiveDate: null,
};

export function createPlayerProfile(
  uid: string,
  displayName: string,
  isDemo: boolean,
): PlayerProfile {
  const now = new Date().toISOString();
  return {
    uid,
    isDemo,
    displayName,
    priority: null,
    playStyle: null,
    goals: [],
    aiContext: null,
    xp: DEFAULT_XP,
    streak: DEFAULT_STREAK,
    createdAt: now,
    updatedAt: now,
  };
}

/* ── Firebase auth wrappers ───────────────────────────────────────── */

export type AuthError = {
  code: string;
  message: string;
  friendlyMessage: string;
};

function toFriendlyError(error: unknown): AuthError {
  const fbError = error as { code?: string; message?: string };
  const code = fbError.code ?? "unknown";
  const message = fbError.message ?? "Something went wrong.";

  const FRIENDLY_MESSAGES: Record<string, string> = {
    "auth/invalid-email": "That email doesn't look right. Please check it.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/email-already-in-use": "An account with that email already exists. Try logging in instead.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase.",
  };

  return {
    code,
    message,
    friendlyMessage: FRIENDLY_MESSAGES[code] ?? "Something went wrong. Please try again.",
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: User } | { error: AuthError }> {
  if (!auth || !hasFirebaseConfig) {
    return {
      error: {
        code: "no-firebase",
        message: "Firebase is not configured.",
        friendlyMessage:
          "Firebase is not set up yet. Use Demo Mode to explore EVOLV, or configure Firebase credentials.",
      },
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    return { user: cred.user };
  } catch (err) {
    return { error: toFriendlyError(err) };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User } | { error: AuthError }> {
  if (!auth || !hasFirebaseConfig) {
    return {
      error: {
        code: "no-firebase",
        message: "Firebase is not configured.",
        friendlyMessage:
          "Firebase is not set up yet. Use Demo Mode to explore EVOLV, or configure Firebase credentials.",
      },
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  } catch (err) {
    return { error: toFriendlyError(err) };
  }
}

export async function signOutUser(): Promise<void> {
  clearDemoSession();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Swallow — user is being logged out regardless
    }
  }
}

/* ── Auth state listener ──────────────────────────────────────────── */

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function.
 * If Firebase is not configured, the callback is invoked once with null.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  if (!auth) {
    // No Firebase — immediately report no user
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
