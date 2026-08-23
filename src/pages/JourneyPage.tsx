/**
 * JourneyPage.tsx — EVOLV Long-Term Progress & Goal Vision Screen.
 *
 * Implements Fix 1 (Remove Mission Duplication):
 *  - Long-term focus: Active Goals, Weekly Theme, Next World Unlock, Weekly Timeline
 *  - Compact daily summary only (no duplicated full mission cards)
 *  - Clear visualization of what the player is working toward
 */
import { useState, useEffect, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../features/auth/AuthContext";
import {
  loadWeeklyJourney,
  saveWeeklyJourney,
  loadDailyMissions,
  loadOnboardingData,
  loadWeeklyMissions,
  loadWeeklyActivity,
  loadActivePlayStyle,
  loadGamificationData,
  loadActivityTargets,
} from "../services/db";
import {
  getTodayDateString,
  generateWeeklyJourney,
} from "../features/missions/missionGenerator";
import { calculateWorldProgression } from "../features/world/worldEngine";
import { computeGoalProgress } from "../features/activity/goalProgress";
import { createInitialGamificationData } from "../features/xp/gamificationEngine";
import type { WeeklyJourney, Mission, DailyActivity, PlayStyle, Goal, GamificationData, ActivityTargets } from "../types";

function getCurrentWeekDates(): { date: string; dayName: string; dayIndex: number }[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return {
      date: `${y}-${m}-${day}`,
      dayName,
      dayIndex: idx,
    };
  });
}

type DayState = "done" | "active" | "missed" | "upcoming";

const DAY_STYLES: Record<DayState, { bg: string; border: string; text: string; icon: string }> = {
  done: {
    bg: "var(--color-evolv-mint-soft)",
    border: "var(--color-evolv-mint)",
    text: "var(--color-evolv-mint-dark)",
    icon: "✓",
  },
  active: {
    bg: "var(--color-evolv-primary-soft)",
    border: "var(--color-evolv-primary)",
    text: "var(--color-evolv-primary)",
    icon: "⚡",
  },
  missed: {
    bg: "var(--color-evolv-surface-raised)",
    border: "var(--color-evolv-border-soft)",
    text: "var(--color-evolv-muted-light)",
    icon: "·",
  },
  upcoming: {
    bg: "transparent",
    border: "var(--color-evolv-border-soft)",
    text: "var(--color-evolv-muted-light)",
    icon: "·",
  },
};

export function JourneyPage() {
  const { session } = useAuth();
  const [journey, setJourney] = useState<WeeklyJourney | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [weekMissions, setWeekMissions] = useState<Mission[]>([]);
  const [weekActivities, setWeekActivities] = useState<DailyActivity[]>([]);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [targets, setTargets] = useState<ActivityTargets | null>(null);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("casual-player");
  const [gamification, setGamification] = useState<GamificationData>(createInitialGamificationData());
  const [loading, setLoading] = useState(true);

  const uid = session?.uid ?? "demo";
  const isDemo = session?.isDemo ?? true;
  const today = getTodayDateString();
  const weekDays = getCurrentWeekDates();

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const onboardData = await loadOnboardingData(uid, isDemo);
      const activeStyle = await loadActivePlayStyle(uid, isDemo);
      const currentStyle = activeStyle ?? onboardData.playStyle ?? "casual-player";
      setPlayStyle(currentStyle);
      setGoals(onboardData.goals || []);

      let currentJourney = await loadWeeklyJourney(uid, isDemo);
      if (!currentJourney) {
        const priority = onboardData.priority ?? "balanced";
        currentJourney = generateWeeklyJourney(
          priority,
          currentStyle,
          onboardData.goals,
          onboardData.playerContext ?? null,
        );
        await saveWeeklyJourney(uid, isDemo, currentJourney);
      }
      setJourney(currentJourney);

      // Load today's missions count & gamification data
      const [todayMissions, gData, tData] = await Promise.all([
        loadDailyMissions(uid, isDemo, today),
        loadGamificationData(uid, isDemo),
        loadActivityTargets(uid, isDemo, onboardData.playerContext ?? null),
      ]);
      setMissions(todayMissions);
      setGamification(gData);
      setTargets(tData);

      // Load week history for all 7 days
      const dates = weekDays.map((d) => d.date);
      const [wMissions, wActivities] = await Promise.all([
        loadWeeklyMissions(uid, isDemo, dates),
        loadWeeklyActivity(uid, isDemo, dates),
      ]);
      setWeekMissions(wMissions);
      setWeekActivities(wActivities);

      const todayAct = wActivities.find((a) => a.date === today);
      if (todayAct) setActivity(todayAct);
    } catch (err) {
      console.error("[JourneyPage] Error loading journey:", err);
    } finally {
      setLoading(false);
    }
  }, [session, uid, isDemo, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize gamification events
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<GamificationData>;
      if (customEvent.detail) {
        setGamification(customEvent.detail);
      }
    };
    window.addEventListener("evolv:gamification-updated", handler);
    return () => window.removeEventListener("evolv:gamification-updated", handler);
  }, []);

  const completedTodayCount = missions.filter((m) => m.completed).length;
  const totalTodayCount = missions.length || 3;

  // Determine state for each day in the week
  const dayStatuses: { day: string; date: string; isToday: boolean; state: DayState; isActive: boolean }[] = weekDays.map((item) => {
    const isToday = item.date === today;
    const isPast = item.date < today;

    const dayMissions = weekMissions.filter((m) => m.date === item.date);
    const completedMissions = dayMissions.filter((m) => m.completed);
    const dayActivity = weekActivities.find((a) => a.date === item.date);

    const hasCompletedMissions = completedMissions.length > 0;
    const hasActivityData =
      dayActivity != null &&
      ((dayActivity.steps ?? 0) > 0 ||
        (dayActivity.walkingMinutes ?? 0) > 0 ||
        (dayActivity.sleepHours ?? 0) > 0);

    const isActive = hasCompletedMissions || hasActivityData;

    if (isActive) {
      return { day: item.dayName, date: item.date, isToday, state: "done", isActive: true };
    }
    if (isToday) {
      return { day: item.dayName, date: item.date, isToday: true, state: "active", isActive: false };
    }
    if (isPast) {
      return { day: item.dayName, date: item.date, isToday: false, state: "missed", isActive: false };
    }
    return { day: item.dayName, date: item.date, isToday: false, state: "upcoming", isActive: false };
  });

  const activeDaysCount = dayStatuses.filter((d) => d.isActive).length;

  const world = calculateWorldProgression(
    gamification.currentLevel,
    gamification.totalXp,
    gamification.realmEnergy,
    playStyle,
  );

  const goalProgressResults = targets && goals.length > 0
    ? computeGoalProgress(goals, missions, activity, targets)
    : [];

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div
        className="px-[var(--space-evolv-page)] pt-12 pb-5"
        style={{
          background:
            "linear-gradient(180deg, var(--color-evolv-mint-soft) 0%, var(--color-evolv-bg) 100%)",
        }}
      >
        <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] font-medium mb-1">
          Week {journey?.weekNumber ?? 1} • Long-Term Progress
        </p>
        <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
          Your Journey
        </h1>
      </div>

      <div className="flex-1 px-[var(--space-evolv-page)] md:px-6 lg:px-8 pb-24 md:pb-10 pt-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">

          {/* ── Left Column: Next Unlock & Active Goals ── */}
          <div className="lg:col-span-6 space-y-6">

            {/* ── NEXT UNLOCK (World-specific, play-style adapted) ── */}
            <section aria-labelledby="next-unlock-heading" className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="next-unlock-heading"
                  className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
                >
                  Next World Milestone
                </h2>
                <Badge variant="mint" size="xs">
                  {gamification.realmEnergy} Realm Energy ⚡
                </Badge>
              </div>

              {world.nextElement ? (
                <Card
                  variant="elevated"
                  className="p-5 border-l-4 border-l-[var(--color-evolv-primary)] bg-gradient-to-br from-[var(--color-evolv-surface)] to-[var(--color-evolv-surface-raised)] space-y-3.5"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-4xl p-2.5 rounded-2xl bg-[var(--color-evolv-primary-soft)] shrink-0">
                      {world.nextElement.icon}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-evolv-primary)] bg-[var(--color-evolv-primary-soft)] px-1.5 py-0.5 rounded">
                          Unlocks at {world.nextElement.requiredEnergy} Energy (Level {world.nextElement.requiredLevel})
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] leading-tight">
                        {world.nextElement.name}
                      </h3>
                      <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
                        {world.nextElement.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--color-evolv-border-soft)]">
                    <div className="flex justify-between text-[var(--text-evolv-xs)]">
                      <span className="text-[var(--color-evolv-muted)]">
                        Energy Progress ({gamification.realmEnergy}/{world.nextElement.requiredEnergy})
                      </span>
                      <span className="font-bold text-[var(--color-evolv-primary)]">
                        {world.energyToNextElement > 0
                          ? `${world.energyToNextElement} Energy needed`
                          : "Ready to expand! ✨"}
                      </span>
                    </div>
                    <ProgressBar
                      value={world.progressToNextElementPct}
                      color="primary"
                      height="sm"
                    />
                  </div>
                </Card>
              ) : (
                <Card variant="soft" className="p-5 text-center space-y-2">
                  <span className="text-3xl">🌟</span>
                  <h3 className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                    {world.currentRealmName} Flourishing
                  </h3>
                  <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                    All major sanctuary landmarks unlocked! Continue daily habits to expand realm vitality.
                  </p>
                </Card>
              )}
            </section>

            {/* ── Active Goals & Goal Progress ── */}
            <section aria-labelledby="goals-heading" className="animate-fade-in-up stagger-1">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="goals-heading"
                  className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
                >
                  Active Goals
                </h2>
                <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                  {goals.length} target{goals.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {loading && goals.length === 0 ? (
                  <div className="py-6 text-center text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
                    Loading goals...
                  </div>
                ) : goals.length === 0 ? (
                  <Card variant="soft" className="py-4 text-center text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
                    Goals will appear here once setup is complete.
                  </Card>
                ) : (
                  goals.map((goal, idx) => {
                    const colors = ["mint", "sky", "primary", "amber", "peach"] as const;
                    const color = colors[idx % colors.length];
                    const progressResult = goalProgressResults.find((r) => r.goalId === goal.id);
                    const progressVal = progressResult?.progress ?? (completedTodayCount > 0 ? 30 : 10);
                    const statusLbl = progressResult?.statusLabel ?? "Steady progress";

                    return (
                      <Card key={goal.id} variant="default" className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-evolv-primary)]" />
                            <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                              {goal.label}
                            </p>
                          </div>
                          <Badge variant={color} size="xs">
                            {progressVal}%
                          </Badge>
                        </div>
                        <ProgressBar value={progressVal} color={color} height="sm" />
                        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                          {statusLbl}
                        </p>
                      </Card>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* ── Right Column: Weekly Theme & Timeline ── */}
          <div className="lg:col-span-6 space-y-6">

            {/* ── Journey Theme & Focus Card ── */}
            <Card
              variant="elevated"
              className="animate-fade-in-up stagger-2 relative overflow-hidden p-5 space-y-2.5"
            >
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-evolv-mint) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <Badge variant="mint" size="sm" className="mb-2">
                  {journey?.focus ? "This week's focus" : "Current path"}
                </Badge>
                <h3 className="font-display font-bold text-[var(--text-evolv-xl)] text-[var(--color-evolv-ink)] mb-1 leading-tight">
                  {journey?.theme ?? "Foundations of Balance"}
                </h3>
                <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] leading-relaxed">
                  {journey?.description ??
                    "Your journey this week introduces small, manageable daily habits tailored to your schedule and play style."}
                </p>
              </div>
            </Card>

            {/* ── Week progress timeline ── */}
            <section aria-labelledby="timeline-heading" className="animate-fade-in-up stagger-3">
              <div className="flex items-end gap-2 mb-3">
                <h2
                  id="timeline-heading"
                  className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] flex-1"
                >
                  Weekly Rhythm
                </h2>
                <Badge variant={activeDaysCount > 0 ? "mint" : "neutral"} size="sm">
                  {activeDaysCount}/7 active days
                </Badge>
              </div>

              {/* Day bubbles */}
              <div className="flex gap-2 justify-between">
                {dayStatuses.map((item) => {
                  const styles = DAY_STYLES[item.state];
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full aspect-square rounded-[var(--radius-evolv-md)] flex items-center justify-center text-base transition-all font-semibold"
                        style={{
                          background: styles.bg,
                          border: item.isToday
                            ? `2px solid ${styles.border}`
                            : item.state === "upcoming"
                            ? "1px dashed var(--color-evolv-border-soft)"
                            : `1px solid ${styles.border}`,
                          color: styles.text,
                          boxShadow: item.isToday && item.state === "active"
                            ? "0 0 0 3px var(--color-evolv-primary-soft)"
                            : "none",
                        }}
                      >
                        {styles.icon}
                      </div>
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: item.isToday
                            ? "var(--color-evolv-primary)"
                            : item.state === "done"
                            ? "var(--color-evolv-mint-dark)"
                            : "var(--color-evolv-muted-light)",
                        }}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Compact Today Action Summary ── */}
            <Card
              variant="soft"
              className="animate-fade-in-up stagger-4 p-4 flex items-center justify-between gap-3 bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-[var(--color-evolv-surface)]">
                  ⚡
                </span>
                <div>
                  <p className="font-semibold text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)]">
                    Today's Progress: {completedTodayCount}/{totalTodayCount} missions complete
                  </p>
                  <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                    Complete actions on Home to earn XP & Realm Energy.
                  </p>
                </div>
              </div>
              <Badge variant={completedTodayCount >= totalTodayCount ? "mint" : "primary"} size="xs">
                {completedTodayCount >= totalTodayCount ? "All Done! 🎉" : "In Progress"}
              </Badge>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
