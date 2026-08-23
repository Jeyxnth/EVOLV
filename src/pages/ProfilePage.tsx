/**
 * ProfilePage — User profile, settings, and session management.
 *
 * Phase 8: Integrates PlayStyleSelectorSheet to allow students to view and
 * change their active play style anytime. Changes persist immediately to
 * Firestore (or sessionStorage in Demo mode) and update presentation without
 * modifying any underlying health goals or activity tracking records.
 */
import { useState, useEffect, useCallback } from "react";
import { AvatarCard } from "../components/profile/AvatarCard";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { SecondaryNav } from "../components/layout/SecondaryNav";
import { useAuth } from "../features/auth/AuthContext";
import {
  loadOnboardingData,
  loadActivePlayStyle,
  saveActivePlayStyle,
  loadGamificationData,
} from "../services/db";
import {
  PLAY_STYLE_CONFIGS,
  type PlayStyleConfig,
} from "../features/playstyle/playStyleAdapter";
import { PlayStyleSelectorSheet } from "../features/playstyle/PlayStyleSelectorSheet";
import { createInitialGamificationData } from "../features/xp/gamificationEngine";
import type { PlayStyle, Goal, WellbeingPriority, GamificationData } from "../types";

interface ProfilePageProps {
  displayName: string;
  isDemo: boolean;
  onLogout: () => Promise<void>;
}

const PRIORITY_LABELS: Record<WellbeingPriority, { label: string; icon: string; variant: "mint" | "sky" | "primary" }> = {
  mental: { label: "Mental Focus", icon: "🧠", variant: "primary" },
  physical: { label: "Physical Energy", icon: "⚡", variant: "mint" },
  balanced: { label: "Balanced", icon: "⚖️", variant: "mint" },
};

export function ProfilePage({ displayName, isDemo, onLogout }: ProfilePageProps) {
  const { session } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("casual-player");
  const [priority, setPriority] = useState<WellbeingPriority>("balanced");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gamification, setGamification] = useState<GamificationData>(createInitialGamificationData());
  const [playStyleSheetOpen, setPlayStyleSheetOpen] = useState(false);

  const uid = session?.uid ?? "demo";

  const loadUserData = useCallback(async () => {
    try {
      const [onboardData, activeStyle, gData] = await Promise.all([
        loadOnboardingData(uid, isDemo),
        loadActivePlayStyle(uid, isDemo),
        loadGamificationData(uid, isDemo),
      ]);
      setPlayStyle(activeStyle ?? onboardData.playStyle ?? "casual-player");
      setPriority(onboardData.priority ?? "balanced");
      setGoals(onboardData.goals ?? []);
      setGamification(gData);
    } catch (err) {
      console.error("[ProfilePage] Error loading profile data:", err);
    }
  }, [uid, isDemo]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handlePlayStyleChange = async (newStyle: PlayStyle) => {
    setPlayStyle(newStyle);
    await saveActivePlayStyle(uid, isDemo, newStyle);
  };

  async function handleLogout() {
    setLoggingOut(true);
    await onLogout();
  }

  const currentPlayStyleCfg: PlayStyleConfig = PLAY_STYLE_CONFIGS[playStyle] ?? PLAY_STYLE_CONFIGS["casual-player"];
  const currentPriorityCfg = PRIORITY_LABELS[priority] ?? PRIORITY_LABELS["balanced"];

  const MENU_ITEMS = [
    { id: "settings", icon: "⚙️", label: "Settings", onClick: () => {} },
    { id: "safety", icon: "🛡️", label: "Safety & Help", onClick: () => {} },
    { id: "account", icon: "👤", label: "Account", onClick: () => {} },
    { id: "about", icon: "✨", label: "About EVOLV", onClick: () => {} },
  ];

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* ── Header ── */}
        <div
          className="px-[var(--space-evolv-page)] pt-12 pb-5"
          style={{
            background:
              "linear-gradient(180deg, var(--color-evolv-peach-soft) 0%, var(--color-evolv-bg) 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
              Profile
            </h1>
            {/* Hamburger */}
            <button
              id="profile-menu-button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="w-10 h-10 rounded-full bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] flex flex-col items-center justify-center gap-1 press-scale"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-4 h-0.5 rounded-full bg-[var(--color-evolv-ink)]"
                />
              ))}
            </button>
          </div>

          <AvatarCard
            displayName={displayName}
            level={gamification.currentLevel}
            totalXp={gamification.totalXp}
            xpIntoCurrentLevel={gamification.xpIntoCurrentLevel}
            xpToNextLevel={gamification.xpToNextLevel}
            playStyle={playStyle}
            currentStreak={gamification.currentStreak}
            completedMissionsToday={gamification.completedMissionIds?.length ?? 0}
            className="animate-fade-in-up"
          />
        </div>

        <div className="px-[var(--space-evolv-page)] md:px-6 lg:px-8 pb-28 md:pb-12 space-y-[var(--space-evolv-section)]">

          {/* ── Session info badge ── */}
          {isDemo && (
            <div className="flex items-center gap-2 animate-fade-in-up">
              <Badge variant="amber" size="sm" icon="🎭">
                Demo Mode
              </Badge>
              <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                Data is not saved permanently
              </span>
            </div>
          )}

          {/* ── Play style & priority ── */}
          <div className="flex gap-3 animate-fade-in-up">
            {/* Play Style Selector Card */}
            <Card
              variant="soft"
              interactive
              onClick={() => setPlayStyleSheetOpen(true)}
              className="flex-1 space-y-1 cursor-pointer press-scale relative group"
            >
              <div className="flex items-center justify-between">
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                  Play style
                </p>
                <span className="text-[10px] text-[var(--color-evolv-primary)] font-semibold underline underline-offset-2">
                  Change
                </span>
              </div>
              <Badge
                variant={currentPlayStyleCfg.colorName === "peach" ? "amber" : currentPlayStyleCfg.colorName}
                size="sm"
                icon={currentPlayStyleCfg.emoji}
              >
                {currentPlayStyleCfg.label}
              </Badge>
            </Card>

            {/* Focus Priority Card */}
            <Card variant="soft" className="flex-1 space-y-1">
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                Focus
              </p>
              <Badge variant={currentPriorityCfg.variant} size="sm" icon={currentPriorityCfg.icon}>
                {currentPriorityCfg.label}
              </Badge>
            </Card>
          </div>

          {/* ── Goals summary ── */}
          <section className="animate-fade-in-up stagger-1">
            <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] mb-3">
              Active Goals
            </h2>
            <div className="space-y-2">
              {goals.length === 0 ? (
                <Card variant="soft" className="py-4 text-center text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
                  No active goals selected yet.
                </Card>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id} variant="outlined" padding="sm" className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <p className="text-[var(--text-evolv-base)] font-medium text-[var(--color-evolv-ink)] flex-1">
                      {goal.label}
                    </p>
                    <Badge variant="mint" size="xs">Active</Badge>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* ── Menu items list ── */}
          <section className="animate-fade-in-up stagger-2">
            <Card variant="default" padding="none" className="overflow-hidden divide-y divide-[var(--color-evolv-border-soft)]">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  id={`profile-${item.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--color-evolv-border-soft)] transition-colors duration-[var(--duration-evolv-fast)] press-scale"
                  onClick={item.onClick}
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <span className="flex-1 font-medium text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                    {item.label}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--color-evolv-muted-light)]">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </Card>
          </section>

          {/* ── Logout / Exit Demo ── */}
          <div className="animate-fade-in-up stagger-3 space-y-2 pt-2">
            <Button
              id="profile-logout-btn"
              variant={isDemo ? "soft" : "danger"}
              fullWidth
              size="md"
              loading={loggingOut}
              onClick={handleLogout}
            >
              {isDemo ? "Exit Demo Mode" : "Log Out"}
            </Button>

            {isDemo && (
              <p className="text-center text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                Sign in to save your progress permanently across devices
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Play Style Selector BottomSheet */}
      <PlayStyleSelectorSheet
        currentPlayStyle={playStyle}
        isOpen={playStyleSheetOpen}
        onClose={() => setPlayStyleSheetOpen(false)}
        onSelect={handlePlayStyleChange}
      />

      {/* Secondary nav drawer */}
      <SecondaryNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
