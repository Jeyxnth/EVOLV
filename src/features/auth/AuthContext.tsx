/**
 * AuthContext — session state provider for EVOLV.
 *
 * Phase 3 + Phase 6.5: provides authentication & onboarding status.
 *
 * States:
 *  1. loading  — resolving auth and loading onboarding status from Firestore / demo storage
 *  2. null     — no session, show entry/login screen
 *  3. session  — authenticated (Firebase user) or demo session active
 *
 * Components consume via useAuth().
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import type { PlayerProfile } from "../../types";
import {
  subscribeToAuthState,
  createDemoSession,
  loadDemoSession,
  clearDemoSession,
  signOutUser,
  createPlayerProfile,
  type DemoSession,
} from "../../services/auth";
import { loadOnboardingData } from "../../services/db";

/* ── Types ────────────────────────────────────────────────────────── */

export interface AuthSession {
  /** Display name — from Firebase profile or demo session */
  displayName: string;
  /** User ID — Firebase uid or demo id */
  uid: string;
  /** True when in demo mode (no Firebase account) */
  isDemo: boolean;
  /** Firebase User object if authenticated, null for demo */
  firebaseUser: User | null;
  /** Initial player profile skeleton */
  profile: PlayerProfile;
}

interface AuthContextValue {
  /** Current session, or null if unauthenticated */
  session: AuthSession | null;
  /** True while resolving session & onboarding status */
  loading: boolean;
  /** True if a user has completed onboarding */
  onboarded: boolean;
  /** Mark the user as having completed onboarding */
  setOnboarded: (v: boolean) => void;
  /** Enter demo mode — instant, no credentials needed */
  enterDemo: () => void;
  /** Sign out (Firebase) or exit demo mode — resets to entry screen */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  /* Subscribe to Firebase auth state and load onboarding status on mount */
  useEffect(() => {
    let isCancelled = false;

    // Check for existing demo session first
    const existingDemo = loadDemoSession();
    if (existingDemo) {
      const demoSess = demoToSession(existingDemo);
      setSession(demoSess);
      // Check demo onboarding status
      loadOnboardingData(demoSess.uid, true).then((data) => {
        if (!isCancelled) {
          setOnboarded(data.onboardingCompleted);
          setLoading(false);
        }
      });
    }

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user takes priority over demo
        clearDemoSession();
        const userSess = firebaseUserToSession(firebaseUser);
        setSession(userSess);

        try {
          const data = await loadOnboardingData(userSess.uid, false);
          if (!isCancelled) {
            setOnboarded(data.onboardingCompleted);
          }
        } catch (err) {
          console.error("[AuthContext] Error loading user onboarding status:", err);
          if (!isCancelled) setOnboarded(false);
        } finally {
          if (!isCancelled) setLoading(false);
        }
      } else {
        // No Firebase user
        const activeDemo = loadDemoSession();
        if (activeDemo) {
          const demoSess = demoToSession(activeDemo);
          setSession(demoSess);
          const data = await loadOnboardingData(demoSess.uid, true);
          if (!isCancelled) {
            setOnboarded(data.onboardingCompleted);
            setLoading(false);
          }
        } else {
          // No Firebase user AND no demo session → unauthenticated
          if (!isCancelled) {
            setSession(null);
            setOnboarded(false);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  const enterDemo = useCallback(async () => {
    setLoading(true);
    const demo = createDemoSession();
    const demoSess = demoToSession(demo);
    setSession(demoSess);
    const data = await loadOnboardingData(demoSess.uid, true);
    setOnboarded(data.onboardingCompleted);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await signOutUser();
    clearDemoSession();
    setSession(null);
    setOnboarded(false);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      onboarded,
      setOnboarded,
      enterDemo,
      logout,
    }),
    [session, loading, onboarded, enterDemo, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

/* ── Converters ───────────────────────────────────────────────────── */

function demoToSession(demo: DemoSession): AuthSession {
  return {
    displayName: demo.displayName,
    uid: demo.uid,
    isDemo: true,
    firebaseUser: null,
    profile: createPlayerProfile(demo.uid, demo.displayName, true),
  };
}

function firebaseUserToSession(user: User): AuthSession {
  const name = user.displayName ?? user.email?.split("@")[0] ?? "Explorer";
  return {
    displayName: name,
    uid: user.uid,
    isDemo: false,
    firebaseUser: user,
    profile: createPlayerProfile(user.uid, name, false),
  };
}
