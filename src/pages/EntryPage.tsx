/**
 * EntryPage — EVOLV landing / welcome screen.
 *
 * Phase 3: polished entry point with EVOLV branding, companion visual,
 * and two clear CTAs: "Start Your Journey" and "Try Demo".
 *
 * Phase 8.5: responsive layout adapting from mobile full-screen to a spacious,
 * centered hero container on desktop.
 */
import { Button } from "../components/ui/Button";
import { CompanionPlaceholder } from "../components/profile/CompanionPlaceholder";

interface EntryPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
}

export function EntryPage({ onStartJourney, onTryDemo }: EntryPageProps) {
  return (
    <div className="min-h-dvh w-full bg-evolv-gradient flex items-center justify-center p-0 md:p-8 lg:p-12">
      {/* Desktop ambient glow */}
      <div
        className="hidden md:block fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,111,240,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Responsive Container: Full screen on mobile, elegant centered card on tablet & desktop */}
      <div
        className={[
          "relative flex flex-col overflow-hidden w-full",
          "min-h-dvh md:min-h-0 md:max-w-lg lg:max-w-xl md:rounded-[2.5rem]",
          "md:shadow-[0_24px_64px_rgba(37,32,64,0.14)] md:border md:border-[var(--color-evolv-border-soft)]",
          "bg-[var(--color-evolv-surface)]",
        ].join(" ")}
      >
        {/* ── Top visual area ── */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center px-6 py-12 md:py-16"
          style={{
            background:
              "linear-gradient(180deg, var(--color-evolv-primary-soft) 0%, var(--color-evolv-surface) 90%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-8 left-8 w-32 h-32 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-evolv-mint-soft) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-12 right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--color-evolv-sky-soft) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* Companion + Logo area */}
          <div className="relative mb-6 animate-fade-in-up">
            <CompanionPlaceholder size="lg" />
          </div>

          {/* Branding */}
          <div className="text-center animate-fade-in-up stagger-1">
            <h1 className="font-display font-extrabold text-[var(--text-evolv-4xl)] text-gradient-primary leading-none mb-3 tracking-tight">
              EVOLV
            </h1>
            <p className="text-[var(--text-evolv-md)] text-[var(--color-evolv-muted)] font-medium max-w-sm leading-relaxed mx-auto">
              Your personalised wellbeing journey.
              <br />
              <span className="text-[var(--color-evolv-primary)] font-semibold">
                Level up your daily life.
              </span>
            </p>
          </div>

          {/* Feature hints */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mt-8 animate-fade-in-up stagger-2">
            {[
              { icon: "🎯", label: "Goals" },
              { icon: "⚡", label: "Missions" },
              { icon: "🔥", label: "Streaks" },
              { icon: "🌍", label: "World" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-11 h-11 rounded-[var(--radius-evolv-md)] bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] border border-[var(--color-evolv-border-soft)] flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <span className="text-[11px] font-semibold text-[var(--color-evolv-muted)]">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA area ── */}
        <div className="shrink-0 px-6 md:px-10 pb-10 pt-4 space-y-3 safe-bottom animate-fade-in-up stagger-3 bg-[var(--color-evolv-surface)]">
          {/* Primary CTA */}
          <Button
            id="entry-start-journey"
            variant="primary"
            size="lg"
            fullWidth
            onClick={onStartJourney}
          >
            Start Your Journey
          </Button>

          {/* Demo CTA */}
          <Button
            id="entry-try-demo"
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onTryDemo}
          >
            ✨ Try Demo
          </Button>

          <p className="text-center text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] pt-1">
            No account needed for demo · Your data stays private
          </p>
        </div>
      </div>
    </div>
  );
}
