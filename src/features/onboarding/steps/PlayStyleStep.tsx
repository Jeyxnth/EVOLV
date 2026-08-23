/**
 * PlayStyleStep — onboarding step 4.
 *
 * This is one of EVOLV's most important features.
 * The selected play style shapes how missions, rewards, and the world feel.
 *
 * Five options: Puzzle Explorer, Quiz Master, Casual Player, Competitor, Explorer/Builder.
 */
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useOnboarding } from "../OnboardingContext";
import type { PlayStyle } from "../../../types";

/* ── Play style data ──────────────────────────────────────────────── */

interface PlayStyleOption {
  value: PlayStyle;
  emoji: string;
  label: string;
  tagline: string;
  description: string;
  flavour: string; // How the EVOLV experience will feel
  accentColor: string;
  softColor: string;
  mutedColor: string;
}

const PLAY_STYLES: PlayStyleOption[] = [
  {
    value: "puzzle-explorer",
    emoji: "🧩",
    label: "Puzzle Explorer",
    tagline: "Discover & Solve",
    description: "You enjoy solving, discovering, and gradually uncovering new challenges.",
    flavour: "Your missions will feel like clues to unlock — each one revealing a little more of your world.",
    accentColor: "var(--color-evolv-primary)",
    softColor: "var(--color-evolv-primary-soft)",
    mutedColor: "var(--color-evolv-primary-muted)",
  },
  {
    value: "quiz-master",
    emoji: "📚",
    label: "Quiz Master",
    tagline: "Learn & Earn",
    description: "You enjoy learning, answering questions, and unlocking knowledge-based challenges.",
    flavour: "Your missions will include reflective questions and knowledge moments that earn XP.",
    accentColor: "var(--color-evolv-sky)",
    softColor: "var(--color-evolv-sky-soft)",
    mutedColor: "var(--color-evolv-sky-muted)",
  },
  {
    value: "casual-player",
    emoji: "☁️",
    label: "Casual Player",
    tagline: "Easy Does It",
    description: "You prefer a relaxed, low-pressure experience that fits naturally into your day.",
    flavour: "Your missions are gentle nudges — short, simple, and always doable.",
    accentColor: "var(--color-evolv-mint)",
    softColor: "var(--color-evolv-mint-soft)",
    mutedColor: "var(--color-evolv-mint-muted)",
  },
  {
    value: "competitor",
    emoji: "🏆",
    label: "Competitor",
    tagline: "Push Your Limits",
    description: "You enjoy milestones, improving your personal performance, and pushing your limits.",
    flavour: "Your missions feature streaks, personal bests, and performance challenges.",
    accentColor: "var(--color-evolv-amber)",
    softColor: "var(--color-evolv-amber-soft)",
    mutedColor: "var(--color-evolv-amber-muted)",
  },
  {
    value: "explorer-builder",
    emoji: "🌍",
    label: "Explorer / Builder",
    tagline: "Build Your World",
    description: "You enjoy discovering new places, unlocking areas, and gradually building something over time.",
    flavour: "Your missions grow your virtual world — every completion reveals something new.",
    accentColor: "var(--color-evolv-peach)",
    softColor: "var(--color-evolv-peach-soft)",
    mutedColor: "var(--color-evolv-peach-muted)",
  },
];

/* ── Component ────────────────────────────────────────────────────── */

export function PlayStyleStep() {
  const { state, setPlayStyle, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<PlayStyle | null>(state.playStyle);
  const [expanded, setExpanded] = useState<PlayStyle | null>(null);

  function handleNext() {
    if (!selected) return;
    setPlayStyle(selected);
    nextStep();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-2 pb-4">
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-widest mb-1">
          Step 3 of 3
        </p>
        <h2 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
          How do you like to play? 🎮
        </h2>
        <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] mt-1">
          This shapes how your entire EVOLV experience feels. You can change it anytime.
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2.5">
        {PLAY_STYLES.map((opt) => {
          const isOn = selected === opt.value;
          const isExpanded = expanded === opt.value;

          return (
            <div
              key={opt.value}
              className={[
                "rounded-[var(--radius-evolv-card)] border-2 overflow-hidden",
                "transition-all duration-[var(--duration-evolv-base)]",
                isOn
                  ? "shadow-[var(--shadow-evolv-md)]"
                  : "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)]",
              ].join(" ")}
              style={isOn ? { background: opt.softColor, borderColor: opt.accentColor } : {}}
            >
              {/* Main row */}
              <button
                id={`playstyle-${opt.value}`}
                onClick={() => {
                  setSelected(opt.value);
                  setExpanded(isExpanded ? null : opt.value);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 press-scale"
              >
                {/* Emoji bubble */}
                <div
                  className="w-11 h-11 rounded-[var(--radius-evolv-md)] flex items-center justify-center text-xl shrink-0 transition-all"
                  style={{ background: isOn ? opt.accentColor : opt.softColor }}
                >
                  {opt.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-display font-bold text-[var(--text-evolv-base)] leading-tight"
                    style={{ color: isOn ? opt.accentColor : "var(--color-evolv-ink)" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] truncate">
                    {opt.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Expand chevron */}
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={["transition-transform text-[var(--color-evolv-muted)]", isExpanded ? "rotate-90" : ""].join(" ")}
                  >
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
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

              {/* Expanded detail — how EVOLV feels with this style */}
              {isExpanded && (
                <div
                  className="px-4 pb-3 pt-0 border-t"
                  style={{ borderColor: isOn ? opt.mutedColor : "var(--color-evolv-border-soft)" }}
                >
                  <p className="text-[var(--text-evolv-xs)] font-semibold text-[var(--color-evolv-muted)] uppercase tracking-wide mb-1.5">
                    What this means for you
                  </p>
                  <p
                    className="text-[var(--text-evolv-sm)] leading-relaxed"
                    style={{ color: isOn ? "var(--color-evolv-ink-alt)" : "var(--color-evolv-muted)" }}
                  >
                    {opt.flavour}
                  </p>
                  {isOn && (
                    <span
                      className="inline-flex items-center gap-1 mt-2 text-[var(--text-evolv-xs)] font-semibold px-2 py-1 rounded-[var(--radius-evolv-pill)] text-white"
                      style={{ background: opt.accentColor }}
                    >
                      ✓ {opt.tagline}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-6 pb-10 pt-3">
        <Button
          id="onboarding-playstyle-next"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          onClick={handleNext}
        >
          {selected
            ? `I'm a ${PLAY_STYLES.find((p) => p.value === selected)?.label} →`
            : "Choose your play style to continue"}
        </Button>
      </div>
    </div>
  );
}
