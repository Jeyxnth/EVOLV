/**
 * WelcomeStep — first onboarding screen.
 *
 * Welcomes the student and frames EVOLV as a personal adventure.
 * CTA advances to the next step (goals).
 */
import { Button } from "../../../components/ui/Button";
import { CompanionPlaceholder } from "../../../components/profile/CompanionPlaceholder";
import { useOnboarding } from "../OnboardingContext";

interface WelcomeStepProps {
  displayName: string;
  isDemo: boolean;
}

export function WelcomeStep({ displayName, isDemo }: WelcomeStepProps) {
  const { nextStep } = useOnboarding();

  return (
    <div className="flex flex-col h-full">
      {/* Visual area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, var(--color-evolv-primary-soft) 0%, var(--color-evolv-bg) 75%)",
        }}
      >
        {/* Decorative ambient orbs */}
        <div
          className="absolute top-12 left-6 w-24 h-24 rounded-full opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-evolv-mint-soft) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-24 right-4 w-16 h-16 rounded-full opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-evolv-sky-soft) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Companion */}
        <div className="mb-6 animate-fade-in-up relative">
          <CompanionPlaceholder size="lg" />
        </div>

        {/* Copy */}
        <div className="animate-fade-in-up stagger-1 space-y-3 max-w-[290px]">
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-widest">
            Your Journey Begins
          </p>
          <h1 className="font-display font-extrabold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
            Hey {displayName}! 👋
            <br />
            Let's build your
            <span className="text-gradient-primary"> adventure.</span>
          </h1>
          <p className="text-[var(--text-evolv-base)] text-[var(--color-evolv-muted)] leading-relaxed">
            EVOLV learns how you like to play and adapts your wellbeing journey to match.
            No two journeys are the same.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up stagger-2">
          {[
            { icon: "🎯", label: "Your goals" },
            { icon: "🎮", label: "Your play style" },
            { icon: "🌍", label: "Your world" },
          ].map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-evolv-pill)] bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] text-[var(--text-evolv-sm)] font-semibold text-[var(--color-evolv-ink)]"
            >
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Demo badge */}
        {isDemo && (
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-4 animate-fade-in-up stagger-3">
            🎭 Demo Mode — exploring as a guest
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0 px-6 pb-10 pt-4 animate-fade-in-up stagger-3">
        <Button
          id="onboarding-welcome-next"
          variant="primary"
          size="lg"
          fullWidth
          onClick={nextStep}
        >
          Build My Journey ✨
        </Button>
      </div>
    </div>
  );
}
