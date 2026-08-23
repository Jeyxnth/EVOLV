/**
 * OnboardingFlow — orchestrates the full onboarding step sequence.
 *
 * Responsibilities:
 *  - Wraps all steps with OnboardingProvider (state machine)
 *  - Renders the phone-frame shell (consistent with EntryPage/LoginPage)
 *  - Shows a progress indicator at the top
 *  - Renders a back button on non-welcome steps
 *  - Persists data via db.ts on completion and calls onComplete
 *
 * Phase 5: AIConversationStep inserted between Welcome and Goals.
 *  - Back navigation is DISABLED on aiConversation step (intentional UX)
 *  - aiContext persisted via savePlayerContext() on completion
 */
import { useCallback } from "react";
import { OnboardingProvider, useOnboarding, type OnboardingState } from "./OnboardingContext";
import { WelcomeStep } from "./steps/WelcomeStep";
import { AIConversationStep } from "./steps/AIConversationStep";
import { GoalStep } from "./steps/GoalStep";
import { PriorityStep } from "./steps/PriorityStep";
import { PlayStyleStep } from "./steps/PlayStyleStep";
import { JourneyRevealStep } from "./steps/JourneyRevealStep";
import {
  saveGoals,
  saveOnboardingProfile,
  markOnboardingComplete,
  savePlayerContext,
  saveWeeklyJourney,
  saveDailyMissions,
} from "../../services/db";
import {
  generateWeeklyJourney,
  generateDailyMissions,
} from "../missions/missionGenerator";

/* ── Props ────────────────────────────────────────────────────────── */

interface OnboardingFlowProps {
  uid: string;
  displayName: string;
  isDemo: boolean;
  onComplete: () => void;
}

/* ── Top-level entry ──────────────────────────────────────────────── */

export function OnboardingFlow({
  uid,
  displayName,
  isDemo,
  onComplete,
}: OnboardingFlowProps) {
  const handleComplete = useCallback(
    async (state: OnboardingState) => {
      // Persist AI context (silently, before other data)
      if (state.aiContext) {
        await savePlayerContext(uid, isDemo, state.aiContext);
      }

      // Persist goals
      await saveGoals(uid, isDemo, state.goals);

      // Persist profile fields
      const priority = state.priority ?? "balanced";
      const playStyle = state.playStyle ?? "casual-player";

      await saveOnboardingProfile(uid, isDemo, {
        displayName,
        priority,
        playStyle,
      });

      // Generate and persist Weekly Journey & Today's Missions
      const journey = generateWeeklyJourney(priority, playStyle, state.goals, state.aiContext);
      await saveWeeklyJourney(uid, isDemo, journey);

      const missions = generateDailyMissions(priority, playStyle, state.goals, state.aiContext);
      await saveDailyMissions(uid, isDemo, missions);

      // Mark onboarding done
      await markOnboardingComplete(uid, isDemo);

      // Navigate into the main app
      onComplete();
    },
    [uid, displayName, isDemo, onComplete],
  );

  return (
    <OnboardingProvider onComplete={handleComplete}>
      <OnboardingShell displayName={displayName} isDemo={isDemo} />
    </OnboardingProvider>
  );
}

/* ── Shell (uses OnboardingContext) ───────────────────────────────── */

function OnboardingShell({
  displayName,
  isDemo,
}: {
  displayName: string;
  isDemo: boolean;
}) {
  const { currentStep, stepIndex, totalSteps, progressFraction, prevStep, isFirstStep } =
    useOnboarding();

  // Back button is hidden on welcome AND aiConversation (conversation should not be re-entered)
  const showBack = !isFirstStep && currentStep !== "aiConversation";

  return (
    // Outer background
    <div className="min-h-dvh w-full bg-evolv-gradient flex items-center justify-center md:p-6 lg:p-10">
      {/* Desktop ambient glow */}
      <div
        className="hidden md:block fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,111,240,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Responsive Onboarding Container */}
      <div
        className={[
          "relative flex flex-col overflow-hidden w-full",
          "min-h-dvh md:min-h-[640px] md:max-h-[860px] md:max-w-2xl md:rounded-[2.5rem]",
          "md:shadow-[0_24px_64px_rgba(37,32,64,0.14)] md:border md:border-[var(--color-evolv-border-soft)]",
          "bg-[var(--color-evolv-surface)]",
        ].join(" ")}
      >
        {/* ── Top chrome: back button + progress ── */}
        <div className="shrink-0 px-5 pt-safe-top pt-4 pb-2 flex items-center gap-3">
          {/* Back button */}
          {showBack ? (
            <button
              id="onboarding-back"
              onClick={prevStep}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border-soft)] press-scale shrink-0"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="var(--color-evolv-muted)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="w-9 h-9 shrink-0" aria-hidden="true" />
          )}

          {/* Progress bar */}
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-evolv-border-soft)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[var(--duration-evolv-slow)] ease-out"
              style={{
                width: `${Math.max(progressFraction * 100, 4)}%`,
                background:
                  "linear-gradient(90deg, var(--color-evolv-primary) 0%, var(--color-evolv-sky) 100%)",
              }}
            />
          </div>

          {/* Step counter */}
          <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold shrink-0 w-9 text-right">
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 overflow-hidden relative">
          {renderStep(currentStep, displayName, isDemo)}
        </div>
      </div>
    </div>
  );
}

/* ── Step router ──────────────────────────────────────────────────── */

function renderStep(
  step: ReturnType<typeof useOnboarding>["currentStep"],
  displayName: string,
  isDemo: boolean,
) {
  switch (step) {
    case "welcome":
      return <WelcomeStep displayName={displayName} isDemo={isDemo} />;

    case "aiConversation":
      return <AIConversationStep />;

    case "goals":
      return <GoalStep />;

    case "priority":
      return <PriorityStep />;

    case "playStyle":
      return <PlayStyleStep />;

    case "reveal":
      return <JourneyRevealStep />;

    default:
      return null;
  }
}
