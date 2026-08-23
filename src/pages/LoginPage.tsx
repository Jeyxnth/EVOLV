/**
 * LoginPage — Email/password authentication screen.
 *
 * Phase 3: supports Login and Sign Up modes with tab toggle.
 * Handles Firebase auth errors with friendly messages.
 * Always shows a "Try Demo instead" escape hatch.
 */
import { useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { signIn, signUp } from "../services/auth";
import { CompanionPlaceholder } from "../components/profile/CompanionPlaceholder";

interface LoginPageProps {
  onBack: () => void;
  onTryDemo: () => void;
  /** Called after successful Firebase auth — parent handles routing */
  onAuthenticated: () => void;
}

type Mode = "login" | "signup";

export function LoginPage({ onBack, onTryDemo, onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && !displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, displayName.trim());

    setLoading(false);

    if ("error" in result) {
      setError(result.error.friendlyMessage);
    } else {
      onAuthenticated();
    }
  }

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

      {/* Responsive Card Container */}
      <div
        className={[
          "relative flex flex-col overflow-hidden w-full",
          "min-h-dvh md:min-h-0 md:max-w-md md:rounded-[2.5rem]",
          "md:shadow-[0_24px_64px_rgba(37,32,64,0.14)] md:border md:border-[var(--color-evolv-border-soft)]",
          "bg-[var(--color-evolv-surface)]",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-4 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-evolv-muted)] hover:text-[var(--color-evolv-ink)] hover:bg-[var(--color-evolv-border-soft)] transition-colors press-scale"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {/* Logo + companion */}
          <div className="flex flex-col items-center mb-6 animate-fade-in-up">
            <CompanionPlaceholder size="sm" className="mb-3" />
            <h1 className="font-display font-extrabold text-[var(--text-evolv-2xl)] text-gradient-primary leading-tight">
              EVOLV
            </h1>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[var(--color-evolv-surface-raised)] rounded-[var(--radius-evolv-md)] p-1 mb-6 animate-fade-in-up stagger-1">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={[
                  "flex-1 py-2.5 rounded-[var(--radius-evolv-sm)] text-[var(--text-evolv-sm)] font-semibold transition-all duration-[var(--duration-evolv-base)]",
                  mode === m
                    ? "bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] text-[var(--color-evolv-ink)]"
                    : "text-[var(--color-evolv-muted)] hover:text-[var(--color-evolv-ink)]",
                ].join(" ")}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up stagger-2">
            {/* Name field (signup only) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-[var(--text-evolv-sm)] font-medium text-[var(--color-evolv-ink)] mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="What should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={[
                    "w-full px-4 py-3 rounded-[var(--radius-evolv-md)]",
                    "bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)]",
                    "text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]",
                    "placeholder:text-[var(--color-evolv-muted-light)]",
                    "focus:outline-none focus:border-[var(--color-evolv-primary)] focus:ring-2 focus:ring-[var(--color-evolv-primary-soft)]",
                    "transition-all duration-[var(--duration-evolv-fast)]",
                  ].join(" ")}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-[var(--text-evolv-sm)] font-medium text-[var(--color-evolv-ink)] mb-1.5"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={[
                  "w-full px-4 py-3 rounded-[var(--radius-evolv-md)]",
                  "bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)]",
                  "text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]",
                  "placeholder:text-[var(--color-evolv-muted-light)]",
                  "focus:outline-none focus:border-[var(--color-evolv-primary)] focus:ring-2 focus:ring-[var(--color-evolv-primary-soft)]",
                  "transition-all duration-[var(--duration-evolv-fast)]",
                ].join(" ")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="block text-[var(--text-evolv-sm)] font-medium text-[var(--color-evolv-ink)] mb-1.5"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={[
                  "w-full px-4 py-3 rounded-[var(--radius-evolv-md)]",
                  "bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)]",
                  "text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]",
                  "placeholder:text-[var(--color-evolv-muted-light)]",
                  "focus:outline-none focus:border-[var(--color-evolv-primary)] focus:ring-2 focus:ring-[var(--color-evolv-primary-soft)]",
                  "transition-all duration-[var(--duration-evolv-fast)]",
                ].join(" ")}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-[var(--radius-evolv-md)] bg-[var(--color-evolv-rose-soft)] text-[var(--color-evolv-rose)] text-[var(--text-evolv-sm)] font-medium animate-fade-in-up"
              >
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              id={mode === "login" ? "auth-login-btn" : "auth-signup-btn"}
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-evolv-border)]" />
            <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">or</span>
            <div className="flex-1 h-px bg-[var(--color-evolv-border)]" />
          </div>

          {/* Demo escape hatch */}
          <Button
            id="auth-try-demo"
            variant="soft"
            size="md"
            fullWidth
            onClick={onTryDemo}
          >
            ✨ Try Demo Instead
          </Button>

          <p className="text-center text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-3">
            No account needed · Explore everything instantly
          </p>
        </div>
      </div>
    </div>
  );
}
