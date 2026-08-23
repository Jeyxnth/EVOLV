/**
 * HomePage.tsx — EVOLV Daily Action Screen.
 *
 * Implements Fix 1 & Fix 2:
 *  - Home answers: "What should I do today?"
 *  - Daily missions with play-style adapted framing + interactive completion
 *  - Real-time XP, Level, Streak, Realm Energy, and Companion reactions
 *  - Quick Sanctuary Growth preview card
 *  - Activity input mini cards
 */
import { useEffect, useState, useCallback } from "react";
import { AvatarCard } from "../components/profile/AvatarCard";
import { Card } from "../components/ui/Card";
import { StreakBadge } from "../components/ui/StreakBadge";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../features/auth/AuthContext";
import {
  loadOnboardingData,
  loadDailyMissions,
  saveDailyMissions,
  toggleMissionCompleted,
  loadDailyActivity,
  saveDailyActivity,
  loadActivityTargets,
  saveActivityTargets,
  loadGamificationData,
  loadActivePlayStyle,
  awardMissionXP,
} from "../services/db";
import {
  getTodayDateString,
  generateDailyMissions,
} from "../features/missions/missionGenerator";
import {
  adaptMission,
  type AdaptedMission,
} from "../features/playstyle/playStyleAdapter";
import { PlayStyleInteractionModal } from "../features/playstyle/PlayStyleInteractionModal";
import { LevelUpModal } from "../features/xp/LevelUpModal";
import { AddMissionSheet } from "../features/missions/AddMissionSheet";
import { LandmarkUnlockModal } from "../features/world/LandmarkUnlockModal";
import { getPlayStyleWorldConfig } from "../features/world/playStyleWorldConfig";
import { calculateWorldProgression } from "../features/world/worldEngine";
import { createInitialGamificationData } from "../features/xp/gamificationEngine";
import {
  ActivityInputSheet,
  type ActivityMetric,
} from "../features/activity/ActivityInputSheet";
import type {
  Mission,
  DailyActivity,
  ActivityTargets,
  GamificationData,
  PlayStyle,
  LevelUpEvent,
  WorldElement,
} from "../types";

function getGreeting(hour: number): string {
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}

function getMotivationalLine(completedCount: number, totalCount: number): string {
  if (totalCount === 0) return "Your journey is loading...";
  const ratio = completedCount / totalCount;
  if (completedCount === 0) return "Every small step matters. Let's begin.";
  if (ratio < 0.5) return "Good start — keep the momentum going.";
  if (ratio < 1) return "Almost there. One more and you're done.";
  return "All missions complete today! ✨";
}

interface ActivityMiniCardProps {
  icon: string;
  label: string;
  value: string;
  subLabel: string;
  progress: number;
  color: "mint" | "primary" | "sky" | "amber";
  onClick: () => void;
}

function ActivityMiniCard({
  icon,
  label,
  value,
  subLabel,
  progress,
  color,
  onClick,
}: ActivityMiniCardProps) {
  return (
    <Card
      variant="default"
      interactive
      onClick={onClick}
      className="flex flex-col gap-2 press-scale"
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[var(--text-evolv-xs)] font-medium"
            style={{ color: "var(--color-evolv-muted)" }}
          >
            {label}
          </p>
          <p
            className="font-display font-bold leading-none mt-0.5"
            style={{
              fontSize: "1.375rem",
              color: "var(--color-evolv-ink)",
            }}
          >
            {value}
          </p>
        </div>
        <span className="text-xl">{icon}</span>
      </div>
      <ProgressBar value={progress} color={color} height="xs" />
      <p
        className="text-[var(--text-evolv-xs)]"
        style={{ color: "var(--color-evolv-muted-light)" }}
      >
        {subLabel}
      </p>
    </Card>
  );
}

export function HomePage() {
  const { session } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [targets, setTargets] = useState<ActivityTargets | null>(null);
  const [playStyle, setPlayStyle] = useState<PlayStyle>("casual-player");
  const [gamification, setGamification] = useState<GamificationData>(createInitialGamificationData());
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
  const [interactionMission, setInteractionMission] = useState<AdaptedMission | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [unlockedLandmark, setUnlockedLandmark] = useState<WorldElement | null>(null);
  const [addMissionOpen, setAddMissionOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<ActivityMetric | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = session?.displayName ?? "Explorer";
  const uid = session?.uid ?? "demo";
  const isDemo = session?.isDemo ?? true;
  const today = getTodayDateString();

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [onboardData, activeStyle, gData] = await Promise.all([
        loadOnboardingData(uid, isDemo),
        loadActivePlayStyle(uid, isDemo),
        loadGamificationData(uid, isDemo),
      ]);

      const currentStyle = activeStyle ?? onboardData.playStyle ?? "casual-player";
      setPlayStyle(currentStyle);
      setGamification(gData);

      let todayMissions = await loadDailyMissions(uid, isDemo, today);
      if (todayMissions.length === 0) {
        const priority = onboardData.priority ?? "balanced";
        todayMissions = generateDailyMissions(
          priority,
          currentStyle,
          onboardData.goals,
          onboardData.playerContext ?? null,
          today,
        );
        await saveDailyMissions(uid, isDemo, todayMissions);
      }
      setMissions(todayMissions);
      setCompletedMissionIds(
        new Set(todayMissions.filter((m) => m.completed).map((m) => m.id)),
      );

      const t = await loadActivityTargets(uid, isDemo, onboardData.playerContext ?? null);
      setTargets(t);

      const a = await loadDailyActivity(uid, isDemo, today);
      setActivity(a ?? { date: today, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("[HomePage] Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [session, uid, isDemo, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize gamification and playstyle events
  useEffect(() => {
    const gamificationHandler = (e: Event) => {
      const customEvent = e as CustomEvent<GamificationData>;
      if (customEvent.detail) {
        setGamification(customEvent.detail);
      }
    };
    const playStyleHandler = (e: Event) => {
      const customEvent = e as CustomEvent<PlayStyle>;
      if (customEvent.detail) {
        setPlayStyle(customEvent.detail);
      }
    };

    window.addEventListener("evolv:gamification-updated", gamificationHandler);
    window.addEventListener("evolv:playstyle-changed", playStyleHandler);
    return () => {
      window.removeEventListener("evolv:gamification-updated", gamificationHandler);
      window.removeEventListener("evolv:playstyle-changed", playStyleHandler);
    };
  }, []);

  const handleToggleMission = async (missionId: string, currentStatus: boolean) => {
    const targetMission = missions.find((m) => m.id === missionId);
    if (!targetMission) return;

    const adapted = adaptMission(targetMission, playStyle);

    // If mission has an uncompleted interactive minigame/quiz, open modal
    if (!currentStatus && adapted.interaction) {
      setInteractionMission(adapted);
      return;
    }

    await executeMissionToggle(missionId, currentStatus, targetMission);
  };

  const executeMissionToggle = async (
    missionId: string,
    currentStatus: boolean,
    targetMission: Mission,
  ) => {
    const updated = !currentStatus;
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: updated } : m)),
    );
    setCompletedMissionIds((prev) => {
      const next = new Set(prev);
      if (updated) next.add(missionId);
      else next.delete(missionId);
      return next;
    });

    await toggleMissionCompleted(uid, isDemo, missionId, updated);

    // Atomic Gamification XP + Realm Energy reward processing
    if (updated) {
      const prevEnergy = gamification.realmEnergy;
      const result = await awardMissionXP(uid, isDemo, targetMission, today);
      setGamification(result.gamification);

      const newEnergy = result.gamification.realmEnergy;
      const worldConfig = getPlayStyleWorldConfig(playStyle, newEnergy, result.gamification.currentLevel);
      const newlyUnlocked = worldConfig.elements.find(
        (el) => el.requiredEnergy <= newEnergy && el.requiredEnergy > prevEnergy,
      );

      if (result.leveledUp && result.levelUpEvent) {
        setLevelUpEvent(result.levelUpEvent);
      } else if (newlyUnlocked) {
        setUnlockedLandmark(newlyUnlocked);
      }
    }
  };

  const handleInteractionComplete = async () => {
    if (!interactionMission) return;
    const missionId = interactionMission.id;
    setInteractionMission(null);
    const targetMission = missions.find((m) => m.id === missionId);
    if (targetMission) {
      await executeMissionToggle(missionId, false, targetMission);
    }
  };

  const handleAddMission = (newMission: Mission) => {
    setMissions((prev) => [...prev, newMission]);
  };

  const handleActivitySave = async (updated: DailyActivity) => {
    setActivity(updated);
    await saveDailyActivity(uid, isDemo, updated);
  };

  const handleTargetSave = async (updated: ActivityTargets) => {
    setTargets(updated);
    await saveActivityTargets(uid, isDemo, updated);
  };

  const completedMissionsCount = completedMissionIds.size;
  const totalMissionsCount = missions.length || 3;
  const missionRingPct = Math.round((completedMissionsCount / totalMissionsCount) * 100);
  const hour = new Date().getHours();
  const greeting = getGreeting(hour);
  const motivationalLine = getMotivationalLine(completedMissionsCount, totalMissionsCount);
  const dayOfWeek = new Date().toLocaleDateString(undefined, { weekday: "long" });

  const world = calculateWorldProgression(
    gamification.currentLevel,
    gamification.totalXp,
    gamification.realmEnergy,
    playStyle,
  );
  const worldConfig = getPlayStyleWorldConfig(
    playStyle,
    gamification.realmEnergy,
    gamification.currentLevel,
  );

  const getCategoryColor = (cat: Mission["category"]) => {
    switch (cat) {
      case "physical":
        return "mint";
      case "mental-reflective":
        return "primary";
      case "digital":
        return "sky";
      case "lifestyle":
        return "amber";
      default:
        return "primary";
    }
  };

  const activityCards: {
    metric: ActivityMetric;
    icon: string;
    label: string;
    value: string;
    subLabel: string;
    progress: number;
    color: "mint" | "primary" | "sky" | "amber";
  }[] = targets
    ? [
        {
          metric: "sleepHours",
          icon: "😴",
          label: "Sleep",
          value: activity?.sleepHours != null ? `${activity.sleepHours}h` : "-",
          subLabel: `Target: ${targets.sleepHours}h`,
          progress:
            activity?.sleepHours != null
              ? Math.min(100, Math.round((activity.sleepHours / targets.sleepHours) * 100))
              : 0,
          color: "primary",
        },
        {
          metric: "waterGlasses",
          icon: "💧",
          label: "Water",
          value: activity?.waterGlasses != null ? `${activity.waterGlasses} gl` : "-",
          subLabel: `Target: ${targets.waterGlasses} gl`,
          progress:
            activity?.waterGlasses != null
              ? Math.min(100, Math.round((activity.waterGlasses / targets.waterGlasses) * 100))
              : 0,
          color: "sky",
        },
        {
          metric: "steps",
          icon: "👟",
          label: "Steps",
          value: activity?.steps != null ? activity.steps.toLocaleString() : "-",
          subLabel: `Target: ${targets.steps.toLocaleString()}`,
          progress:
            activity?.steps != null
              ? Math.min(100, Math.round((activity.steps / targets.steps) * 100))
              : 0,
          color: "mint",
        },
        {
          metric: "screenTimeHours",
          icon: "📱",
          label: "Screen time",
          value: activity?.screenTimeHours != null ? `${activity.screenTimeHours}h` : "-",
          subLabel: `Target: <= ${targets.screenTimeHours}h`,
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
      ]
    : [];

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Top Hero Header ── */}
      <div
        className="px-[var(--space-evolv-page)] pt-12 pb-5"
        style={{
          background:
            "linear-gradient(180deg, var(--color-evolv-primary-soft) 0%, var(--color-evolv-bg) 100%)",
        }}
      >
        <div className="mb-4 animate-fade-in-up">
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] font-medium">
            {greeting} 👋
          </p>
          <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
            {displayName}
          </h1>
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] mt-0.5">
            {motivationalLine}
          </p>
        </div>

        {/* Avatar Card with Live Gamification & Companion */}
        <div className="animate-fade-in-up stagger-1">
          <AvatarCard
            displayName={displayName}
            level={gamification.currentLevel}
            totalXp={gamification.totalXp}
            xpIntoCurrentLevel={gamification.xpIntoCurrentLevel}
            xpToNextLevel={gamification.xpToNextLevel}
            playStyle={playStyle}
            completedMissionsToday={completedMissionsCount}
            currentStreak={gamification.currentStreak}
          />
        </div>
      </div>

      <div className="flex-1 px-[var(--space-evolv-page)] pb-6 space-y-[var(--space-evolv-section)]">

        {/* ── At a Glance Stats ── */}
        <div className="flex gap-3 animate-fade-in-up stagger-2">
          <Card className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="var(--color-evolv-border-soft)"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="var(--color-evolv-mint)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - missionRingPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)]">
                  {completedMissionsCount}/{totalMissionsCount}
                </span>
              </div>
            </div>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              missions
            </p>
          </Card>

          <Card className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
            <StreakBadge streak={gamification.currentStreak} size="md" />
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              day streak
            </p>
          </Card>

          <Card className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
            <p className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-primary)]">
              ⚡ {gamification.realmEnergy}
            </p>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              realm energy
            </p>
          </Card>
        </div>

        {/* ── Today's Missions ── */}
        <section aria-labelledby="missions-heading" className="animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2
                id="missions-heading"
                className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
              >
                Today's Missions
              </h2>
              <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                • {dayOfWeek}
              </span>
            </div>

            {/* + Add Mission Button */}
            <button
              type="button"
              id="home-add-mission-btn"
              onClick={() => setAddMissionOpen(true)}
              className="text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-primary)] hover:text-[var(--color-evolv-primary-dark)] bg-[var(--color-evolv-primary-soft)] hover:bg-[var(--color-evolv-border-soft)] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all press-scale"
              aria-label="Add a mission for today"
            >
              <span>+ Add Mission</span>
            </button>
          </div>

          {loading && missions.length === 0 ? (
            <div className="py-6 text-center text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
              Preparing your missions...
            </div>
          ) : (
            <div className="space-y-2.5">
              {missions.map((mission, i) => {
                const color = getCategoryColor(mission.category);
                const isCompleted = completedMissionIds.has(mission.id);
                const adapted = adaptMission(mission, playStyle);

                return (
                  <Card
                    key={mission.id}
                    variant={isCompleted ? "soft" : "default"}
                    interactive
                    onClick={() => handleToggleMission(mission.id, isCompleted)}
                    className={[
                      "flex items-center gap-3.5 p-4 cursor-pointer press-scale",
                      `animate-fade-in-up stagger-${i + 1}`,
                      isCompleted ? "opacity-75" : "",
                    ].join(" ")}
                  >
                    <div
                      className="w-11 h-11 rounded-[var(--radius-evolv-md)] flex items-center justify-center text-xl shrink-0 transition-transform"
                      style={{
                        background: isCompleted
                          ? "var(--color-evolv-mint-soft)"
                          : `var(--color-evolv-${color}-soft)`,
                      }}
                    >
                      {isCompleted ? "✓" : (mission.icon ?? "⚡")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-evolv-muted)] bg-[var(--color-evolv-surface-raised)] px-1.5 py-0.5 rounded inline-block mb-0.5">
                        {adapted.framingTag}
                      </span>
                      <p
                        className={[
                          "font-semibold text-[var(--text-evolv-base)] leading-tight truncate",
                          isCompleted
                            ? "line-through text-[var(--color-evolv-muted)]"
                            : "text-[var(--color-evolv-ink)]",
                        ].join(" ")}
                      >
                        {adapted.presentationTitle}
                      </p>
                      {adapted.presentationDescription && (
                        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] truncate mt-0.5">
                          {adapted.presentationDescription}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isCompleted ? (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-[var(--shadow-evolv-sm)] animate-bounce-in"
                          style={{
                            background: "var(--color-evolv-mint)",
                            color: "white",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <Badge
                            variant={
                              color === "primary"
                                ? "primary"
                                : color === "sky"
                                ? "sky"
                                : "mint"
                            }
                            size="xs"
                          >
                            +{mission.xpReward} XP
                          </Badge>
                          <span className="text-[10px] font-semibold text-[var(--color-evolv-primary)] mt-0.5">
                            +10 ⚡
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Sanctuary & World Growth Preview ── */}
        <section aria-labelledby="world-preview-heading" className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="world-preview-heading"
              className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
            >
              Your Sanctuary Growth
            </h2>
            <Badge variant="primary" size="xs">
              {world.currentRealmName}
            </Badge>
          </div>

          <Card
            variant="elevated"
            className="p-4 bg-gradient-to-r from-[var(--color-evolv-surface)] to-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)] space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-[var(--color-evolv-mint-soft)] shrink-0">
                {world.nextElement?.icon ?? "🌟"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] leading-tight truncate">
                  {world.nextElement ? `Next: ${world.nextElement.name}` : `${world.currentRealmName} Flourishing`}
                </p>
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] truncate">
                  {world.nextElement
                    ? `Requires ${world.nextElement.requiredEnergy}⚡ Realm Energy`
                    : "All current landmarks restored!"}
                </p>
              </div>
              <Badge variant="mint" size="xs">
                {world.unlockedAreasCount}/4 Regions
              </Badge>
            </div>

            {world.nextElement && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--color-evolv-muted)]">
                  <span>Energy Progress ({gamification.realmEnergy}/{world.nextElement.requiredEnergy})</span>
                  <span className="font-bold text-[var(--color-evolv-primary)]">
                    {world.energyToNextElement > 0 ? `${world.energyToNextElement}⚡ needed` : "Ready! ✨"}
                  </span>
                </div>
                <ProgressBar
                  value={world.progressToNextElementPct}
                  color="mint"
                  height="xs"
                />
              </div>
            )}
          </Card>
        </section>

        {/* ── Section 5: Activity Snapshot ── */}
        <section aria-labelledby="activity-heading" className="animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="activity-heading"
              className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
            >
              Today's Activity
            </h2>
            <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              Tap to update
            </span>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton h-24 rounded-[var(--radius-evolv-card)]"
                />
              ))}
            </div>
          ) : targets ? (
            <div className="grid grid-cols-2 gap-3">
              {activityCards.map((card) => (
                <ActivityMiniCard
                  key={card.metric}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  subLabel={card.subLabel}
                  progress={card.progress}
                  color={card.color}
                  onClick={() => setActiveMetric(card.metric)}
                />
              ))}
            </div>
          ) : (
            <Card variant="soft" className="py-4 text-center">
              <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
                Activity tracking will appear here.
              </p>
            </Card>
          )}
        </section>
      </div>

      {/* Activity Input Sheet Modal */}
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

      {/* Play-Style Interactive Modal */}
      {interactionMission && (
        <PlayStyleInteractionModal
          isOpen={interactionMission !== null}
          mission={interactionMission}
          playStyle={playStyle}
          onClose={() => {
            handleInteractionComplete();
          }}
        />
      )}

      {/* Level Up Celebration Modal */}
      {levelUpEvent && (
        <LevelUpModal
          isOpen={levelUpEvent !== null}
          newLevel={levelUpEvent.newLevel}
          totalXp={levelUpEvent.totalXp}
          playStyle={playStyle}
          onClose={() => setLevelUpEvent(null)}
        />
      )}

      {/* Landmark Milestone Celebration Modal */}
      {unlockedLandmark && (
        <LandmarkUnlockModal
          isOpen={unlockedLandmark !== null}
          element={unlockedLandmark}
          worldTheme={worldConfig.worldTheme}
          onClose={() => setUnlockedLandmark(null)}
        />
      )}

      {/* User-Added Missions Bottom Sheet */}
      <AddMissionSheet
        isOpen={addMissionOpen}
        onClose={() => setAddMissionOpen(false)}
        onAddMission={handleAddMission}
        existingMissionCount={missions.length}
        todayDate={today}
      />
    </div>
  );
}
