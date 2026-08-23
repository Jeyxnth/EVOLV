/**
 * App — EVOLV root component.
 *
 * Phase 4: OnboardingPlaceholder replaced with real OnboardingFlow.
 *
 *  1. "entry"       → EntryPage / LoginPage (unauthenticated)
 *  2. "onboarding"  → OnboardingFlow (authenticated but not yet set up)
 *  3. "app"         → AppShell with bottom navigation (fully entered)
 *
 * The AuthProvider wraps the tree so all descendants can useAuth().
 * Session persistence prevents route-flash on reload.
 */
import { useState } from "react";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import { AppShell } from "../components/layout/AppShell";
import type { NavPage } from "../components/layout/BottomNav";
import { Spinner } from "../components/ui/LoadingState";

import { EntryPage } from "../pages/EntryPage";
import { LoginPage } from "../pages/LoginPage";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { HomePage } from "../pages/HomePage";
import { JourneyPage } from "../pages/JourneyPage";
import { WorldPage } from "../pages/WorldPage";
import { ProgressPage } from "../pages/ProgressPage";
import { ProfilePage } from "../pages/ProfilePage";

/* ─── Outer wrapper — provides AuthContext ─────────────────────────── */

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

/* ─── Route logic ──────────────────────────────────────────────────── */

type AuthScreen = "entry" | "login";

function AppRouter() {
  const { session, loading, onboarded, setOnboarded, enterDemo, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("entry");
  const [activePage, setActivePage] = useState<NavPage>("home");

  /* ── Loading splash while Firebase initializes ── */
  if (loading) {
    return (
      <div className="min-h-dvh w-full bg-evolv-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[var(--color-evolv-primary-soft)] flex items-center justify-center">
            <span className="font-display font-extrabold text-[var(--text-evolv-xl)] text-[var(--color-evolv-primary)]">
              E
            </span>
          </div>
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  /* ── No session → Entry / Login ── */
  if (!session) {
    if (authScreen === "login") {
      return (
        <LoginPage
          onBack={() => setAuthScreen("entry")}
          onTryDemo={() => {
            enterDemo();
            setAuthScreen("entry");
          }}
          onAuthenticated={() => {
            // Firebase auth state listener in AuthContext will set the session.
            // Nothing extra needed here — the component re-renders.
          }}
        />
      );
    }

    return (
      <EntryPage
        onStartJourney={() => setAuthScreen("login")}
        onTryDemo={() => enterDemo()}
      />
    );
  }

  /* ── Session exists, not yet onboarded → Onboarding flow ── */
  if (!onboarded) {
    return (
      <OnboardingFlow
        uid={session.uid}
        displayName={session.displayName}
        isDemo={session.isDemo}
        onComplete={() => setOnboarded(true)}
      />
    );
  }

  /* ── Fully entered → Main app ── */
  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {renderMainPage(activePage, session.displayName, session.isDemo, logout)}
    </AppShell>
  );
}

function renderMainPage(
  page: NavPage,
  displayName: string,
  isDemo: boolean,
  logout: () => Promise<void>,
) {
  switch (page) {
    case "home":     return <HomePage />;
    case "journey":  return <JourneyPage />;
    case "world":    return <WorldPage />;
    case "progress": return <ProgressPage />;
    case "profile":  return <ProfilePage displayName={displayName} isDemo={isDemo} onLogout={logout} />;
  }
}

export default App;
