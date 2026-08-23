/**
 * JourneyRevealStep — final onboarding screen.
 *
 * Shows a visual summary of the user's setup and creates anticipation
 * before entering the main application. Calls onComplete to persist data.
 */
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { CompanionPlaceholder } from "../../../components/profile/CompanionPlaceholder";
import { Card } from "../../../components/ui/Card";
import { useOnboarding, useOnboardingComplete } from "../OnboardingContext";
import type { WellbeingPriority, PlayStyle } from "../../../types";

/* ── Display helpers ──────────────────────────────────────────────── */

const PRIORITY_LABELS: Record<WellbeingPriority, { label: string; emoji: string; color: string }> = {
  mental: { label: "Mental Wellbeing", emoji: "🧘", color: "var(--color-evolv-primary)" },
  physical: { label: "Physical Wellbeing", emoji: "🏃", color: "var(--color-evolv-mint)" },
  balanced: { label: "Balanced Growth", emoji: "⚖️", color: "var(--color-evolv-sky)" },
};

const PLAY_STYLE_LABELS: Record<PlayStyle, { label: string; emoji: string; color: string }> = {
  "puzzle-explorer": { label: "Puzzle Explorer", emoji: "🧩", color: "var(--color-evolv-primary)" },
  "quiz-master": { label: "Quiz Master", emoji: "📚", color: "var(--color-evolv-sky)" },
  "casual-player": { label: "Casual Player", emoji: "☁️", color: "var(--color-evolv-mint)" },
  "competitor": { label: "Competitor", emoji: "🏆", color: "var(--color-evolv-amber)" },
  "explorer-builder": { label: "Explorer / Builder", emoji: "🌍", color: "var(--color-evolv-peach)" },
};

/* ── Component ────────────────────────────────────────────────────── */

export function JourneyRevealStep() {
  const { state } = useOnboarding();
  const onComplete = useOnboardingComplete();
  const [saving, setSaving] = useState(false);

  const priorityInfo = state.priority ? PRIORITY_LABELS[state.priority] : null;
  const playStyleInfo = state.playStyle ? PLAY_STYLE_LABELS[state.playStyle] : null;

  async function handleEnter() {
    setSaving(true);
    await onComplete(state);
    // Parent (OnboardingFlow) handles routing after this
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
      {/* Visual celebration area */}
      <div
        className="shrink-0 flex flex-col items-center justify-center pt-8 pb-6 px-8 text-center relative"
        style={{
          background:
            "linear-gradient(180deg, var(--color-evolv-primary-soft) 0%, var(--color-evolv-bg) 100%)",
        }}
      >
        {/* Ambient confetti dots */}
        {[
          { top: "10%", left: "12%", color: "var(--color-evolv-mint)", size: 8 },
          { top: "15%", right: "10%", color: "var(--color-evolv-amber)", size: 6 },
          { top: "40%", left: "5%", color: "var(--color-evolv-sky)", size: 5 },
          { top: "35%", right: "8%", color: "var(--color-evolv-peach)", size: 7 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-companion-glow pointer-events-none"
            style={{
              top: dot.top,
              left: "left" in dot ? dot.left : undefined,
              right: "right" in dot ? dot.right as string : undefined,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              opacity: 0.6,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Companion */}
        <div className="mb-4 animate-bounce-in">
          <CompanionPlaceholder size="lg" />
        </div>

        <div className="animate-fade-in-up stagger-1">
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-widest mb-1">
            ✨ You're all set
          </p>
          <h2 className="font-display font-extrabold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
            Your Journey Is
            <span className="text-gradient-primary"> Taking Shape</span>
          </h2>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-1 pb-8 space-y-3 animate-fade-in-up stagger-2 scroll-smooth">

        {/* Goals */}
        <Card variant="default" className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎯</span>
            <p className="text-[var(--text-evolv-xs)] font-semibold text-[var(--color-evolv-muted)] uppercase tracking-wide">
              Your Goals ({state.goals.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.goals.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-evolv-pill)] bg-[var(--color-evolv-primary-soft)] text-[var(--color-evolv-primary)] text-[var(--text-evolv-xs)] font-semibold"
              >
                {g.isCustom ? "✍️ " : ""}{g.label}
              </span>
            ))}
          </div>
        </Card>

        {/* Priority */}
        {priorityInfo && (
          <Card variant="default" className="flex items-center gap-3 animate-fade-in-up stagger-2">
            <div
              className="w-10 h-10 rounded-[var(--radius-evolv-md)] flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--color-evolv-primary-soft)" }}
            >
              {priorityInfo.emoji}
            </div>
            <div>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-wide">
                Wellbeing Focus
              </p>
              <p
                className="font-display font-bold text-[var(--text-evolv-base)]"
                style={{ color: priorityInfo.color }}
              >
                {priorityInfo.label}
              </p>
            </div>
          </Card>
        )}

        {/* Play style */}
        {playStyleInfo && (
          <Card variant="default" className="flex items-center gap-3 animate-fade-in-up stagger-3">
            <div
              className="w-10 h-10 rounded-[var(--radius-evolv-md)] flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--color-evolv-amber-soft)" }}
            >
              {playStyleInfo.emoji}
            </div>
            <div>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-wide">
                Play Style
              </p>
              <p
                className="font-display font-bold text-[var(--text-evolv-base)]"
                style={{ color: playStyleInfo.color }}
              >
                {playStyleInfo.label}
              </p>
            </div>
          </Card>
        )}

        {/* Tease */}
        <div className="text-center py-2">
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">
            🌱 Your first missions are being prepared…
          </p>
        </div>
      </div>

      {/* Enter CTA */}
      <div className="shrink-0 px-6 pb-6 pt-3 bg-[var(--color-evolv-surface)] border-t border-[var(--color-evolv-border-soft)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] animate-fade-in-up stagger-4">
        <Button
          id="onboarding-enter-evolv"
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          onClick={handleEnter}
        >
          {saving ? "Setting up…" : "Enter EVOLV ✨"}
        </Button>
      </div>
    </div>
  );
}
