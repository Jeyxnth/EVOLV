/**
 * ProgressPage - EVOLV Phase 11 Unified Progress & Analytics View.
 *
 * Implements:
 *  - Live Gamification overview (Current Level, XP Bar, Realm Energy, Daily Streak)
 *  - Weekly Consistency chart (last 7 days activity & mission completion trends)
 *  - Goal progress cards with active completion tracking
 *  - Interactive Daily Activity metrics (Steps, Sleep, Screen Time, Water, Walking, Running)
 *  - Real-time synchronization with gamification updates
 *  - Polished responsive layout and progressive disclosure
 */
import { useState, useEffect, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StreakBadge } from "../components/ui/StreakBadge";
import { LevelBadge } from "../components/ui/LevelBadge";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../features/auth/AuthContext";
import {
  loadOnboardingData,
  loadDailyMissions,
  loadDailyActivity,
  saveDailyActivity,
  loadWeeklyActivity,
  loadActivityTargets,
  saveActivityTargets,
  loadGamificationData,
} from "../services/db";
import { createInitialGamificationData } from "../features/xp/gamificationEngine";
import { getTodayDateString } from "../features/missions/missionGenerator";
import { computeGoalProgress } from "../features/activity/goalProgress";
import { computeStreak, getLast7Days } from "../features/activity/streakUtils";
import {
  ActivityInputSheet,
  type ActivityMetric,
} from "../features/activity/ActivityInputSheet";
import type { Mission, Goal, DailyActivity, ActivityTargets, GamificationData } from "../types";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_DOW = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export function ProgressPage() {
  const { session } = useAuth();
  const [gamification, setGamification] = useState<GamificationData>(createInitialGamificationData());
  const [missions, setMissions] = useState<Mission[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [targets, setTargets] = useState<ActivityTargets | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<ActivityMetric | null>(null);

  const uid = session?.uid ?? "demo";
  const isDemo = session?.isDemo ?? true;
  const today = getTodayDateString();

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [onboardData, gData, todayMissions] = await Promise.all([
        loadOnboardingData(uid, isDemo),
        loadGamificationData(uid, isDemo),
        loadDailyMissions(uid, isDemo, today),
      ]);

      setGoals(onboardData.goals);
      setGamification(gData);
      setMissions(todayMissions);

      const t = await loadActivityTargets(uid, isDemo, onboardData.playerContext ?? null);
      setTargets(t);

      const a = await loadDailyActivity(uid, isDemo, today);
      setActivity(a ?? { date: today, updatedAt: new Date().toISOString() });

      const dates = getLast7Days(today);
      setWeekDates(dates);
      const wActivity = await loadWeeklyActivity(uid, isDemo, dates);
      setWeeklyActivity(wActivity);
    } catch (err) {
      console.error("[ProgressPage] Error loading progress data:", err);
    } finally {
      setLoading(false);
    }
  }, [session, uid, isDemo, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize gamification events across pages
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

  const handleActivitySave = async (updated: DailyActivity) => {
    setActivity(updated);
    await saveDailyActivity(uid, isDemo, updated);
  };

  const handleTargetSave = async (updated: ActivityTargets) => {
    setTargets(updated);
    await saveActivityTargets(uid, isDemo, updated);
  };

  // Streak from today's missions and activity
  const { currentStreak, activeDaysInWindow, windowDays } = computeStreak(missions, today);

  // Goal progress
  const goalProgressResults = targets && goals.length > 0
    ? computeGoalProgress(goals, missions, activity, targets)
    : [];

  // Weekly bar chart: missions completed per day
  const weekBarData = weekDates.map((date) => {
    const dayActivity = weeklyActivity.find((a) => a.date === date);
    if (!targets) return 0;
    const stepsScore = dayActivity?.steps != null ? Math.min(100, Math.round((dayActivity.steps / targets.steps) * 100)) : null;
    const waterScore = dayActivity?.waterGlasses != null ? Math.min(100, Math.round((dayActivity.waterGlasses / targets.waterGlasses) * 100)) : null;
    const sleepScore = dayActivity?.sleepHours != null ? Math.min(100, Math.round((dayActivity.sleepHours / targets.sleepHours) * 100)) : null;
    const scores = [stepsScore, waterScore, sleepScore].filter((s) => s != null) as number[];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  const hasAnyData = weekBarData.some((v) => v > 0) || missions.some((m) => m.completed);

  // Stats grid config
  type StatColor = "mint" | "primary" | "sky" | "amber";
  const statCards: {
    metric: ActivityMetric;
    icon: string;
    label: string;
    value: string;
    sub: string;
    progress: number;
    color: StatColor;
  }[] = targets
    ? [
        {
          metric: "steps",
          icon: "👟",
          label: "Steps",
          value: activity?.steps != null ? activity.steps.toLocaleString() : "-",
          sub: `Goal: ${targets.steps.toLocaleString()}`,
          progress: activity?.steps != null ? Math.min(100, Math.round((activity.steps / targets.steps) * 100)) : 0,
          color: "mint",
        },
        {
          metric: "sleepHours",
          icon: "😴",
          label: "Sleep",
          value: activity?.sleepHours != null ? `${activity.sleepHours}h` : "-",
          sub: `Goal: ${targets.sleepHours}h`,
          progress: activity?.sleepHours != null ? Math.min(100, Math.round((activity.sleepHours / targets.sleepHours) * 100)) : 0,
          color: "primary",
        },
        {
          metric: "screenTimeHours",
          icon: "📱",
          label: "Screen time",
          value: activity?.screenTimeHours != null ? `${activity.screenTimeHours}h` : "-",
          sub: `Goal: <= ${targets.screenTimeHours}h`,
          progress:
            activity?.screenTimeHours != null
              ? Math.min(
                  100,
                  Math.round(
                    Math.max(
                      0,
                      (targets.screenTimeHours * 2 - activity.screenTimeHours) /
                        (targets.screenTimeHours * 2),
                    ) * 100,
                  ),
                )
              : 0,
          color: "amber",
        },
        {
          metric: "walkingMinutes",
          icon: "🚶",
          label: "Walking",
          value: activity?.walkingMinutes != null ? `${activity.walkingMinutes}m` : "-",
          sub: `Goal: ${targets.walkingMinutes}m`,
          progress:
            activity?.walkingMinutes != null
              ? Math.min(100, Math.round((activity.walkingMinutes / Math.max(targets.walkingMinutes, 1)) * 100))
              : 0,
          color: "sky",
        },
        {
          metric: "waterGlasses",
          icon: "💧",
          label: "Water",
          value: activity?.waterGlasses != null ? `${activity.waterGlasses} gl` : "-",
          sub: `Goal: ${targets.waterGlasses} gl`,
          progress:
            activity?.waterGlasses != null
              ? Math.min(100, Math.round((activity.waterGlasses / targets.waterGlasses) * 100))
              : 0,
          color: "sky",
        },
        {
          metric: "runningMinutes",
          icon: "🏃",
          label: "Running",
          value: activity?.runningMinutes != null ? `${activity.runningMinutes}m` : "-",
          sub: `Goal: ${targets.runningMinutes}m`,
          progress:
            activity?.runningMinutes != null && targets.runningMinutes > 0
              ? Math.min(100, Math.round((activity.runningMinutes / targets.runningMinutes) * 100))
              : 0,
          color: "mint",
        },
      ]
    : [];

  const completedTodayCount = missions.filter((m) => m.completed).length;
  const xpPct = Math.min(
    100,
    Math.round((gamification.xpIntoCurrentLevel / Math.max(gamification.xpToNextLevel, 1)) * 100),
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page Header ── */}
      <div
        className="px-[var(--space-evolv-page)] md:px-6 lg:px-8 pt-8 pb-5"
        style={{
          background:
            "linear-gradient(180deg, var(--color-evolv-amber-soft) 0%, var(--color-evolv-bg) 100%)",
        }}
      >
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium mb-0.5">
          {hasAnyData ? "Personal growth & consistency" : "Your journey starts here."}
        </p>
        <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
          Your Progress
        </h1>
      </div>

      <div className="px-[var(--space-evolv-page)] md:px-6 lg:px-8 pb-24 md:pb-10 space-y-6">
        {/* ── Gamification Progression Hero Card ── */}
        <Card variant="elevated" className="animate-fade-in-up p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LevelBadge level={gamification.currentLevel} size="md" />
              <div>
                <p className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] leading-tight">
                  Level {gamification.currentLevel} Progress
                </p>
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                  {gamification.totalXp} Total XP Earned
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="primary" size="sm">
                ⚡ {gamification.realmEnergy} Energy
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-[var(--color-evolv-border-soft)]">
            <div className="flex items-center justify-between text-[var(--text-evolv-xs)]">
              <span className="font-medium text-[var(--color-evolv-muted)]">
                Level {gamification.currentLevel + 1} Threshold
              </span>
              <span className="font-bold text-[var(--color-evolv-primary)]">
                {gamification.xpIntoCurrentLevel} / {gamification.xpToNextLevel} XP ({xpPct}%)
              </span>
            </div>
            <ProgressBar value={xpPct} color="primary" height="sm" />
          </div>
        </Card>

        {/* ── Streak & Daily Momentum Highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in-up stagger-1">
          <Card variant="default" className="flex items-center gap-4 p-4">
            <div
              className="w-12 h-12 rounded-[var(--radius-evolv-card)] flex items-center justify-center text-2xl shrink-0"
              style={{ background: "var(--color-evolv-amber-soft)" }}
            >
              🔥
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium mb-0.5">
                Current Streak
              </p>
              <StreakBadge
                streak={currentStreak}
                activeDaysInWindow={activeDaysInWindow}
                windowDays={windowDays}
                size="md"
              />
            </div>
          </Card>

          <Card variant="default" className="flex items-center gap-4 p-4">
            <div
              className="w-12 h-12 rounded-[var(--radius-evolv-card)] flex items-center justify-center text-2xl shrink-0"
              style={{ background: "var(--color-evolv-mint-soft)" }}
            >
              ✅
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium mb-0.5">
                Missions Done Today
              </p>
              <p className="font-display font-bold text-[var(--text-evolv-xl)] text-[var(--color-evolv-mint-dark)]">
                {completedTodayCount} Completed
              </p>
            </div>
          </Card>
        </div>

        {/* ── Weekly Consistency Bar Chart ── */}
        <section className="animate-fade-in-up stagger-2" aria-label="Weekly activity">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]">
              This Week's Consistency
            </h2>
            <Badge variant="sky" size="sm">
              {activeDaysInWindow}/{windowDays} active days
            </Badge>
          </div>
          <Card variant="default" padding="md">
            {!hasAnyData ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] text-center">
                  Start tracking your activities and your weekly chart will appear here.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-24 pt-2">
                {weekBarData.map((pct, i) => {
                  const isToday = i === TODAY_DOW;
                  const isPast = weekDates[i] < today;
                  const hasValue = pct > 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className="w-full rounded-t-[var(--radius-evolv-sm)] transition-all duration-[var(--duration-evolv-xslow)]"
                          style={{
                            height: `${Math.max(pct, 6)}%`,
                            background: isToday
                              ? "var(--color-evolv-primary)"
                              : hasValue && isPast
                              ? "var(--color-evolv-primary-muted)"
                              : "var(--color-evolv-border-soft)",
                            minHeight: "4px",
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: isToday
                            ? "var(--color-evolv-primary)"
                            : "var(--color-evolv-muted-light)",
                        }}
                      >
                        {WEEK_LABELS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        {/* ── Active Goal Progress ── */}
        {goals.length > 0 && (
          <section className="animate-fade-in-up stagger-3" aria-label="Goal progress">
            <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] mb-3">
              Goal Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalProgressResults.map((result, idx) => {
                const goal = goals.find((g) => g.id === result.goalId);
                if (!goal) return null;
                const colors = ["mint", "sky", "primary", "amber", "peach"] as const;
                const color = colors[idx % colors.length];
                return (
                  <Card key={result.goalId} variant="soft" className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                        {goal.label}
                      </p>
                      {result.hasData ? (
                        <span className="text-[var(--text-evolv-sm)] font-bold text-[var(--color-evolv-ink)]">
                          {result.progress}%
                        </span>
                      ) : (
                        <Badge variant="primary" size="xs">
                          new
                        </Badge>
                      )}
                    </div>
                    {result.hasData ? (
                      <ProgressBar value={result.progress} color={color} height="sm" />
                    ) : (
                      <div
                        className="h-2 rounded-full"
                        style={{ background: "var(--color-evolv-border-soft)" }}
                      />
                    )}
                    <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                      {result.statusLabel}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Today's Activity Detail Grid ── */}
        <section aria-label="Activity statistics" className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]">
              Today's Activity Tracking
            </h2>
            <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
              Tap any metric to update
            </span>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-24 rounded-[var(--radius-evolv-card)]" />
              ))}
            </div>
          ) : statCards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statCards.map((stat, i) => (
                <Card
                  key={stat.metric}
                  variant="default"
                  interactive
                  onClick={() => setActiveMetric(stat.metric)}
                  className={`animate-fade-in-up stagger-${i + 1} p-3.5 space-y-2 press-scale cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                        {stat.label}
                      </p>
                      <p className="font-display font-bold text-[var(--text-evolv-xl)] text-[var(--color-evolv-ink)] leading-none mt-0.5">
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <ProgressBar value={stat.progress} color={stat.color} height="xs" />
                  <p className="text-[10px] text-[var(--color-evolv-muted)] truncate">{stat.sub}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="soft" className="py-8 text-center">
              <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
                Start tracking your journey and your progress will appear here.
              </p>
            </Card>
          )}
        </section>
      </div>

      {activeMetric && activity && targets && (
        <ActivityInputSheet
          metric={activeMetric}
          activity={activity}
          targets={targets}
          isOpen={activeMetric !== null}
          onClose={() => setActiveMetric(null)}
          onSave={handleActivitySave}
          onUpdateTarget={handleTargetSave}
        />
      )}
    </div>
  );
}
