/**
 * goalProgress.ts - independent, transparent per-goal progress calculation.
 *
 * Each goal's progress is derived from:
 *  1. Relevant mission completions (matched by category/tags)
 *  2. Relevant activity metrics (matched by goal category)
 *
 * Philosophy:
 *  - Simple and transparent: the student should understand why they see what they see.
 *  - Conservative: never inflate. If data is sparse, show early-stage.
 *  - No complex scoring formula. Max 100 points with clear sub-components.
 */
import type { Goal, Mission, DailyActivity, ActivityTargets } from '../../types';

export interface GoalProgressResult {
  goalId: string;
  /** 0-100, rounded to nearest integer */
  progress: number;
  /** Whether we have enough data to show a meaningful percentage */
  hasData: boolean;
  /** Short explanation shown to the student */
  statusLabel: string;
}

const GOAL_MISSION_CATEGORIES: Record<string, string[]> = {
  'physical-activity': ['physical'],
  'sleep':             ['digital', 'lifestyle'],
  'stress-management': ['mental-reflective'],
  'social-connection': ['mental-reflective', 'lifestyle'],
  'academic-balance':  ['mental-reflective'],
  'screen-time':       ['digital'],
  'other':             ['physical', 'mental-reflective', 'lifestyle'],
};

interface ScoreContext {
  completedMissions: Mission[];
  totalMissions: Mission[];
  activity: DailyActivity | null;
  targets: ActivityTargets;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function computeGoalScore(goal: Goal, ctx: ScoreContext): { score: number; hasData: boolean } {
  const { completedMissions, totalMissions, activity, targets } = ctx;
  const relevantCategories = GOAL_MISSION_CATEGORIES[goal.category] ?? GOAL_MISSION_CATEGORIES['other'];

  // Mission contribution: up to 60 pts
  const relevantTotal = totalMissions.filter(m => relevantCategories.includes(m.category)).length;
  const relevantCompleted = completedMissions.filter(m => relevantCategories.includes(m.category)).length;
  const missionScore = relevantTotal > 0 ? (relevantCompleted / relevantTotal) * 60 : 0;

  // Activity metric contribution: up to 40 pts
  let activityScore = 0;
  let activityHasData = false;

  if (activity) {
    switch (goal.category) {
      case 'physical-activity': {
        const stepsRatio = activity.steps != null ? clamp(activity.steps / targets.steps, 0, 1) : 0;
        const walkRatio = activity.walkingMinutes != null ? clamp(activity.walkingMinutes / Math.max(targets.walkingMinutes, 1), 0, 1) : 0;
        const runRatio = activity.runningMinutes != null ? clamp(activity.runningMinutes / Math.max(targets.runningMinutes, 1), 0, 1) : 0;
        const hasAny = activity.steps != null || activity.walkingMinutes != null || activity.runningMinutes != null;
        if (hasAny) { activityScore = (stepsRatio * 0.5 + walkRatio * 0.3 + runRatio * 0.2) * 40; activityHasData = true; }
        break;
      }
      case 'sleep': {
        if (activity.sleepHours != null) {
          activityScore = clamp(activity.sleepHours / targets.sleepHours, 0, 1) * 40;
          activityHasData = true;
        }
        break;
      }
      case 'screen-time': {
        if (activity.screenTimeHours != null) {
          const ratio = clamp(activity.screenTimeHours / Math.max(targets.screenTimeHours, 0.5), 0, 2);
          activityScore = clamp((2 - ratio) / 2, 0, 1) * 40;
          activityHasData = true;
        }
        break;
      }
      case 'stress-management':
      case 'academic-balance':
      case 'social-connection': {
        if (activity.waterGlasses != null || activity.steps != null) {
          activityScore = 10; activityHasData = true;
        }
        break;
      }
      default: {
        if (activity.waterGlasses != null) {
          activityScore += clamp(activity.waterGlasses / Math.max(targets.waterGlasses, 1), 0, 1) * 20;
          activityHasData = true;
        }
        if (activity.steps != null) {
          activityScore += clamp(activity.steps / Math.max(targets.steps, 1), 0, 1) * 20;
          activityHasData = true;
        }
        break;
      }
    }
  }

  const hasData = relevantTotal > 0 || activityHasData;
  const score = Math.round(clamp(missionScore + activityScore, 0, 100));
  return { score, hasData };
}

function statusLabel(progress: number, hasData: boolean): string {
  if (!hasData) return 'Just getting started';
  if (progress === 0) return 'Not started yet today';
  if (progress < 20) return 'First steps taken';
  if (progress < 40) return 'Building momentum';
  if (progress < 60) return 'Making progress';
  if (progress < 80) return 'Going strong';
  if (progress < 100) return 'Almost there!';
  return 'Completed today';
}

export function computeGoalProgress(
  goals: Goal[],
  missions: Mission[],
  activity: DailyActivity | null,
  targets: ActivityTargets,
): GoalProgressResult[] {
  const completedMissions = missions.filter(m => m.completed);
  return goals.map(goal => {
    const { score, hasData } = computeGoalScore(goal, { completedMissions, totalMissions: missions, activity, targets });
    return { goalId: goal.id, progress: score, hasData, statusLabel: statusLabel(score, hasData) };
  });
}
