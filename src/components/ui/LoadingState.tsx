/**
 * LoadingState — spinner and skeleton utilities.
 */

/** Spinner: simple circular loading indicator */
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "muted";
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-10 h-10 border-[3px]",
};

const spinnerColors = {
  primary: "border-[var(--color-evolv-primary-soft)] border-t-[var(--color-evolv-primary)]",
  white: "border-white/30 border-t-white",
  muted: "border-[var(--color-evolv-border)] border-t-[var(--color-evolv-muted)]",
};

export function Spinner({ size = "md", color = "primary", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        "rounded-full animate-spin",
        spinnerSizes[size],
        spinnerColors[color],
        className,
      ].join(" ")}
    />
  );
}

/** SkeletonLine: a single shimmer placeholder line */
interface SkeletonLineProps {
  width?: string;    // css width e.g. "60%" or "8rem"
  height?: string;   // css height, default "1rem"
  className?: string;
}

export function SkeletonLine({ width = "100%", height = "1rem", className = "" }: SkeletonLineProps) {
  return (
    <div
      aria-hidden="true"
      className={["skeleton rounded-[var(--radius-evolv-sm)]", className].join(" ")}
      style={{ width, height }}
    />
  );
}

/** LoadingScreen: full-page centered spinner for route transitions */
export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
      <Spinner size="lg" />
      <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)]">Loading…</p>
    </div>
  );
}
