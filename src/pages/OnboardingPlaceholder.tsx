/**
 * OnboardingPlaceholder — temporary screen after auth/demo entry.
 *
 * Phase 3: confirms the user has entered EVOLV successfully.
 * Phase 4 will replace this with the real onboarding flow
 * (AI conversation → Goals → Priority → Play Style).
 */
import { Button } from "../components/ui/Button";
import { CompanionPlaceholder } from "../components/profile/CompanionPlaceholder";
import { Card } from "../components/ui/Card";

interface OnboardingPlaceholderProps {
  displayName: string;
  isDemo: boolean;
  /** Called when the user clicks "Begin Setup" — enters the main app for now */
  onBeginSetup: () => void;
}

export function OnboardingPlaceholder({
  displayName,
  isDemo,
  onBeginSetup,
}: OnboardingPlaceholderProps) {
  return (
    <div className="min-h-dvh w-full bg-evolv-gradient flex items-center justify-center md:p-6 lg:p-10">
      {/* Desktop ambient glow */}
      <div
        className="hidden md:block fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,111,240,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Responsive Container */}
      <div
        className={[
          "relative flex flex-col overflow-hidden w-full",
          "min-h-dvh md:min-h-0 md:max-w-lg md:rounded-[2.5rem]",
          "md:shadow-[0_24px_64px_rgba(37,32,64,0.14)] md:border md:border-[var(--color-evolv-border-soft)]",
          "bg-[var(--color-evolv-surface)]",
        ].join(" ")}
      >
        {/* ── Content ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          {/* Companion */}
          <div className="mb-6 animate-fade-in-up">
            <CompanionPlaceholder size="lg" />
          </div>

          {/* Welcome message */}
          <div className="animate-fade-in-up stagger-1 mb-8">
            <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] font-medium mb-2">
              Welcome to EVOLV
            </p>
            <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight mb-3">
              Hey, {displayName}! 👋
            </h1>
            <p className="text-[var(--text-evolv-base)] text-[var(--color-evolv-muted)] max-w-[280px] mx-auto leading-relaxed">
              Let's set up your personalised wellbeing journey.
              It only takes a few minutes.
            </p>
          </div>

          {/* What's ahead preview */}
          <Card variant="soft" className="w-full max-w-xs animate-fade-in-up stagger-2">
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-semibold uppercase tracking-wide mb-3">
              What's ahead
            </p>
            <div className="space-y-2.5">
              {[
                { icon: "💬", label: "Quick conversation about you" },
                { icon: "🎯", label: "Choose your wellbeing goals" },
                { icon: "⚖️", label: "Pick your priority focus" },
                { icon: "🎮", label: "Select your play style" },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2.5">
                  <span className="text-base">{step.icon}</span>
                  <span className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] font-medium">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demo badge */}
          {isDemo && (
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-4 animate-fade-in-up stagger-3">
              🎭 Demo Mode — exploring as a guest
            </p>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="shrink-0 px-6 pb-10 pt-4 safe-bottom animate-fade-in-up stagger-3">
          <Button
            id="onboarding-begin-setup"
            variant="primary"
            size="lg"
            fullWidth
            onClick={onBeginSetup}
          >
            Begin Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
