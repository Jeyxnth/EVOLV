/**
 * GoalStep — onboarding step 2.
 *
 * Lets the student choose up to 6 wellbeing goals.
 * Supports both suggested goals and completely custom ones.
 * Internal categories are kept hidden from the UI.
 */
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useOnboarding } from "../OnboardingContext";
import type { Goal, GoalCategory } from "../../../types";

/* ── Suggested goals data ─────────────────────────────────────────── */

interface SuggestedGoal {
  label: string;
  description: string;
  category: GoalCategory;
  emoji: string;
}

const SUGGESTED_GOALS: SuggestedGoal[] = [
  { label: "Improve my sleep", description: "Build a consistent, restful sleep routine.", category: "sleep", emoji: "😴" },
  { label: "Become more active", description: "Move more and build physical habits.", category: "physical-activity", emoji: "🏃" },
  { label: "Reduce screen time", description: "Take back control of my digital habits.", category: "screen-time", emoji: "📱" },
  { label: "Manage stress better", description: "Find calm and balance in busy periods.", category: "stress-management", emoji: "🧘" },
  { label: "Build a consistent routine", description: "Create structure and healthy daily habits.", category: "other", emoji: "📅" },
  { label: "Drink more water", description: "Stay hydrated and feel more energised.", category: "physical-activity", emoji: "💧" },
  { label: "Improve my focus", description: "Concentrate better and reduce distractions.", category: "academic-balance", emoji: "🎯" },
  { label: "Journal regularly", description: "Reflect on my day and track my growth.", category: "stress-management", emoji: "📓" },
  { label: "Feel more balanced", description: "Improve overall mental and physical harmony.", category: "other", emoji: "⚖️" },
];

const MAX_GOALS = 6;

function makeGoalId() {
  return "goal_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function buildGoal(label: string, category: GoalCategory, isCustom: boolean): Goal {
  return {
    id: makeGoalId(),
    label,
    category,
    isCustom,
    status: "active",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
}

/* ── Component ────────────────────────────────────────────────────── */

export function GoalStep() {
  const { state, setGoals, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<Goal[]>(state.goals);
  const [customText, setCustomText] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const atLimit = selected.length >= MAX_GOALS;

  function isSuggestionSelected(label: string) {
    return selected.some((g) => g.label === label && !g.isCustom);
  }

  function toggleSuggestion(sg: SuggestedGoal) {
    if (isSuggestionSelected(sg.label)) {
      setSelected((prev) => prev.filter((g) => g.label !== sg.label || g.isCustom));
    } else {
      if (atLimit) return;
      setSelected((prev) => [...prev, buildGoal(sg.label, sg.category, false)]);
    }
  }

  function addCustomGoal() {
    const trimmed = customText.trim();
    if (!trimmed) {
      setCustomError("Please type your goal first.");
      return;
    }
    if (trimmed.length > 80) {
      setCustomError("Keep it under 80 characters.");
      return;
    }
    if (atLimit) {
      setCustomError(`You can have up to ${MAX_GOALS} goals.`);
      return;
    }
    if (selected.some((g) => g.label.toLowerCase() === trimmed.toLowerCase())) {
      setCustomError("That goal is already added.");
      return;
    }
    setCustomError(null);
    setSelected((prev) => [...prev, buildGoal(trimmed, "other", true)]);
    setCustomText("");
  }

  function removeGoal(id: string) {
    setSelected((prev) => prev.filter((g) => g.id !== id));
  }

  function handleNext() {
    setGoals(selected);
    nextStep();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-2 pb-4">
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-widest mb-1">
          Step 1 of 3
        </p>
        <h2 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
          What do you want to improve? 🎯
        </h2>
        <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] mt-1">
          Choose up to {MAX_GOALS} goals, or write your own.
        </p>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selected.map((g) => (
              <button
                key={g.id}
                onClick={() => removeGoal(g.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-evolv-pill)] bg-[var(--color-evolv-primary)] text-white text-[var(--text-evolv-xs)] font-semibold press-scale transition-all"
                title="Tap to remove"
              >
                {g.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {/* Suggested goals */}
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTED_GOALS.map((sg) => {
            const isOn = isSuggestionSelected(sg.label);
            return (
              <button
                key={sg.label}
                onClick={() => toggleSuggestion(sg)}
                disabled={atLimit && !isOn}
                className={[
                  "w-full text-left flex items-center gap-3 px-4 py-3 rounded-[var(--radius-evolv-card)]",
                  "border transition-all duration-[var(--duration-evolv-base)] press-scale",
                  isOn
                    ? "bg-[var(--color-evolv-primary)] border-[var(--color-evolv-primary)] text-white shadow-[var(--shadow-evolv-glow)]"
                    : atLimit
                    ? "bg-[var(--color-evolv-surface-raised)] border-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)] opacity-50 cursor-not-allowed"
                    : "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)] hover:border-[var(--color-evolv-primary-muted)] hover:bg-[var(--color-evolv-primary-soft)]",
                ].join(" ")}
              >
                <span className="text-xl shrink-0">{sg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={["font-semibold text-[var(--text-evolv-base)] truncate", isOn ? "text-white" : "text-[var(--color-evolv-ink)]"].join(" ")}>
                    {sg.label}
                  </p>
                  <p className={["text-[var(--text-evolv-xs)] truncate", isOn ? "text-white/80" : "text-[var(--color-evolv-muted)]"].join(" ")}>
                    {sg.description}
                  </p>
                </div>
                {isOn && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                    <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.25)" />
                    <path d="M5.5 9l2.5 2.5 4.5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom goal input */}
        <Card variant="soft" className="space-y-2">
          <p className="text-[var(--text-evolv-xs)] font-semibold text-[var(--color-evolv-muted)] uppercase tracking-wide">
            Or write your own
          </p>
          <div className="flex gap-2">
            <input
              id="goal-custom-input"
              type="text"
              placeholder="e.g. Read before bed every night…"
              value={customText}
              onChange={(e) => { setCustomText(e.target.value); setCustomError(null); }}
              onKeyDown={(e) => e.key === "Enter" && addCustomGoal()}
              maxLength={80}
              className={[
                "flex-1 px-3 py-2.5 rounded-[var(--radius-evolv-md)]",
                "bg-[var(--color-evolv-surface)] border text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]",
                "placeholder:text-[var(--color-evolv-muted-light)]",
                "focus:outline-none focus:border-[var(--color-evolv-primary)] focus:ring-2 focus:ring-[var(--color-evolv-primary-soft)]",
                customError ? "border-[var(--color-evolv-rose)]" : "border-[var(--color-evolv-border)]",
              ].join(" ")}
            />
            <Button
              id="goal-add-custom"
              variant="soft"
              size="sm"
              onClick={addCustomGoal}
              disabled={atLimit}
            >
              Add
            </Button>
          </div>
          {customError && (
            <p role="alert" className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-rose)] font-medium">
              {customError}
            </p>
          )}
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-6 pb-10 pt-3">
        <Button
          id="onboarding-goals-next"
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected.length === 0}
          onClick={handleNext}
        >
          {selected.length === 0 ? "Select at least one goal" : `Continue with ${selected.length} goal${selected.length !== 1 ? "s" : ""} →`}
        </Button>
      </div>
    </div>
  );
}
