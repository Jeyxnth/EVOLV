/**
 * OnboardingContext — state machine for the onboarding flow.
 *
 * Phase 4 step order: welcome → goals → priority → playStyle → reveal
 * Phase 5 step order: welcome → aiConversation → goals → priority → playStyle → reveal
 *
 * Consumed via useOnboarding() in each step component.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Goal, WellbeingPriority, PlayStyle, PlayerAIContext } from "../../types";

/* ── Step definition ──────────────────────────────────────────────── */

/**
 * All possible onboarding steps — in order.
 */
export type OnboardingStep =
  | "welcome"
  | "aiConversation"
  | "goals"
  | "priority"
  | "playStyle"
  | "reveal";

/** Phase 5: aiConversation is now active. */
const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "aiConversation",
  "goals",
  "priority",
  "playStyle",
  "reveal",
];

/* ── State shape ──────────────────────────────────────────────────── */

export interface OnboardingState {
  goals: Goal[];
  priority: WellbeingPriority | null;
  playStyle: PlayStyle | null;
  /** Structured context from the AI conversation. Internal only — never shown to player. */
  aiContext: PlayerAIContext | null;
}

interface OnboardingContextValue {
  /** The currently active step */
  currentStep: OnboardingStep;
  /** 0-based index of the current step */
  stepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** 0–1 fraction for a progress bar */
  progressFraction: number;
  /** All collected onboarding answers */
  state: OnboardingState;
  /** Go to the next step */
  nextStep: () => void;
  /** Go back to the previous step */
  prevStep: () => void;
  /** Update goals */
  setGoals: (goals: Goal[]) => void;
  /** Update priority */
  setPriority: (p: WellbeingPriority) => void;
  /** Update play style */
  setPlayStyle: (ps: PlayStyle) => void;
  /** Store the AI-extracted context (internal — never shown to player) */
  setAIContext: (ctx: PlayerAIContext) => void;
  /** Whether we're on the first step (no back allowed) */
  isFirstStep: boolean;
  /** Whether we're on the final step */
  isLastStep: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────────── */

interface OnboardingProviderProps {
  children: ReactNode;
  /** Called when the user completes the final step */
  onComplete: (state: OnboardingState) => Promise<void>;
}

export function OnboardingProvider({
  children,
  onComplete,
}: OnboardingProviderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    goals: [],
    priority: null,
    playStyle: null,
    aiContext: null,
  });

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  // Progress fraction: counts steps except "welcome" and "reveal" as content steps
  const progressFraction = totalSteps <= 1 ? 1 : stepIndex / (totalSteps - 1);

  const nextStep = useCallback(() => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, totalSteps]);

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  const setGoals = useCallback((goals: Goal[]) => {
    setState((s) => ({ ...s, goals }));
  }, []);

  const setPriority = useCallback((priority: WellbeingPriority) => {
    setState((s) => ({ ...s, priority }));
  }, []);

  const setPlayStyle = useCallback((playStyle: PlayStyle) => {
    setState((s) => ({ ...s, playStyle }));
  }, []);

  const setAIContext = useCallback((aiContext: PlayerAIContext) => {
    setState((s) => ({ ...s, aiContext }));
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      currentStep,
      stepIndex,
      totalSteps,
      progressFraction,
      state,
      nextStep,
      prevStep,
      setGoals,
      setPriority,
      setPlayStyle,
      setAIContext,
      isFirstStep,
      isLastStep,
    }),
    [
      currentStep,
      stepIndex,
      totalSteps,
      progressFraction,
      state,
      nextStep,
      prevStep,
      setGoals,
      setPriority,
      setPlayStyle,
      setAIContext,
      isFirstStep,
      isLastStep,
    ],
  );

  // Expose onComplete so the reveal step can call it
  // We attach it to the context value via a ref trick to avoid re-renders
  return (
    <OnboardingContext.Provider value={value}>
      {/* Pass onComplete down via a separate prop on the children wrapper */}
      <OnboardingCompleteContext.Provider value={onComplete}>
        {children}
      </OnboardingCompleteContext.Provider>
    </OnboardingContext.Provider>
  );
}

/* ── Completion context (kept separate to avoid polluting main ctx) ── */

const OnboardingCompleteContext = createContext<
  ((state: OnboardingState) => Promise<void>) | null
>(null);

/* ── Hooks ────────────────────────────────────────────────────────── */

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within <OnboardingProvider>");
  return ctx;
}

export function useOnboardingComplete(): (state: OnboardingState) => Promise<void> {
  const ctx = useContext(OnboardingCompleteContext);
  if (!ctx) throw new Error("useOnboardingComplete must be used within <OnboardingProvider>");
  return ctx;
}
