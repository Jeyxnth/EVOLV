/**
 * PriorityStep — onboarding step 3.
 *
 * Lets the student choose their current wellbeing focus:
 *   Mental Wellbeing / Physical Wellbeing / Balanced Growth
 *
 * The student is always in control — this is their choice, not the AI's.
 */
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useOnboarding } from "../OnboardingContext";
import type { WellbeingPriority } from "../../../types";

/* ── Priority options ─────────────────────────────────────────────── */

interface PriorityOption {
  value: WellbeingPriority;
  emoji: string;
  label: string;
  tagline: string;
  description: string;
  accentColor: string;
  softColor: string;
}

const PRIORITIES: PriorityOption[] = [
  {
    value: "mental",
    emoji: "🧘",
    label: "Mental Wellbeing",
    tagline: "Mind first",
    description: "Focus on reflection, balance, rest, and emotional wellbeing. Build calm habits that support a clearer mind.",
    accentColor: "var(--color-evolv-primary)",
    softColor: "var(--color-evolv-primary-soft)",
  },
  {
    value: "physical",
    emoji: "🏃",
    label: "Physical Wellbeing",
    tagline: "Body first",
    description: "Focus on movement, sleep, routines, and physical habits. Build energy and momentum through action.",
    accentColor: "var(--color-evolv-mint)",
    softColor: "var(--color-evolv-mint-soft)",
  },
  {
    value: "balanced",
    emoji: "⚖️",
    label: "Balanced Growth",
    tagline: "Mind and body",
    description: "Build progress across both mind and body. A holistic approach where improvements reinforce each other.",
    accentColor: "var(--color-evolv-sky)",
    softColor: "var(--color-evolv-sky-soft)",
  },
];

/* ── Component ────────────────────────────────────────────────────── */

export function PriorityStep() {
  const { state, setPriority, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<WellbeingPriority | null>(state.priority);

  function handleNext() {
    if (!selected) return;
    setPriority(selected);
    nextStep();
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-2 pb-4">
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-widest mb-1">
          Step 2 of 3
        </p>
        <h2 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
          Where do you want to focus? ⚖️
        </h2>
        <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] mt-1">
          You can always adjust this later. This is your journey.
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-1 pb-8 space-y-3 scroll-smooth">
        {PRIORITIES.map((opt) => {
          const isOn = selected === opt.value;
          return (
            <button
              key={opt.value}
              id={`priority-${opt.value}`}
              onClick={() => setSelected(opt.value)}
              className={[
                "w-full text-left rounded-[var(--radius-evolv-card)] p-4 border-2",
                "transition-all duration-[var(--duration-evolv-base)] press-scale",
                isOn
                  ? "shadow-[var(--shadow-evolv-md)]"
                  : "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)] hover:border-[var(--color-evolv-border)]",
              ].join(" ")}
              style={
                isOn
                  ? {
                      background: opt.softColor,
                      borderColor: opt.accentColor,
                    }
                  : {}
              }
            >
              <div className="flex items-start gap-4">
                {/* Icon bubble */}
                <div
                  className="w-12 h-12 rounded-[var(--radius-evolv-card)] flex items-center justify-center text-2xl shrink-0"
                  style={{ background: isOn ? opt.accentColor : opt.softColor }}
                >
                  {opt.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="font-display font-bold text-[var(--text-evolv-lg)] leading-tight"
                      style={{ color: isOn ? opt.accentColor : "var(--color-evolv-ink)" }}
                    >
                      {opt.label}
                    </p>
                    {isOn && (
                      <span
                        className="text-[var(--text-evolv-xs)] font-semibold px-2 py-0.5 rounded-[var(--radius-evolv-pill)] text-white"
                        style={{ background: opt.accentColor }}
                      >
                        {opt.tagline}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[var(--text-evolv-sm)] leading-relaxed"
                    style={{
                      color: isOn ? "var(--color-evolv-ink-alt)" : "var(--color-evolv-muted)",
                    }}
                  >
                    {opt.description}
                  </p>
                </div>

                {/* Selection indicator */}
                <div
                  className={[
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  ].join(" ")}
                  style={{
                    borderColor: isOn ? opt.accentColor : "var(--color-evolv-border)",
                    background: isOn ? opt.accentColor : "transparent",
                  }}
                >
                  {isOn && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <p className="text-center text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] pt-2">
          ✨ EVOLV adapts — this focus shapes your missions, not limits them.
        </p>
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-6 pb-6 pt-3 bg-[var(--color-evolv-surface)] border-t border-[var(--color-evolv-border-soft)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <Button
          id="onboarding-priority-next"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          onClick={handleNext}
        >
          {selected ? "Continue →" : "Choose a focus to continue"}
        </Button>
      </div>
    </div>
  );
}
