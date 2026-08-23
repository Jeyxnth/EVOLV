/**
 * ProgressBar — EVOLV reusable progress bar.
 *
 * Used for:
 *  - XP progress within a level
 *  - Goal completion
 *  - Mission completion rate
 *  - Activity tracking metrics
 */
interface ProgressBarProps {
  value: number;        // current value
  max?: number;         // max value (default 100)
  color?: "primary" | "mint" | "amber" | "sky" | "peach";
  height?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;  // show percentage text
  animated?: boolean;   // animate fill on mount
  className?: string;
  label?: string;       // optional aria-label
}

const colorStyles = {
  primary: {
    track: "bg-[var(--color-evolv-primary-soft)]",
    fill: "bg-gradient-to-r from-[var(--color-evolv-primary)] to-[var(--color-evolv-primary-muted)]",
  },
  mint: {
    track: "bg-[var(--color-evolv-mint-soft)]",
    fill: "bg-gradient-to-r from-[var(--color-evolv-mint)] to-[var(--color-evolv-mint-muted)]",
  },
  amber: {
    track: "bg-[var(--color-evolv-amber-soft)]",
    fill: "bg-gradient-to-r from-[var(--color-evolv-amber)] to-[var(--color-evolv-amber-muted)]",
  },
  sky: {
    track: "bg-[var(--color-evolv-sky-soft)]",
    fill: "bg-gradient-to-r from-[var(--color-evolv-sky)] to-[var(--color-evolv-sky-muted)]",
  },
  peach: {
    track: "bg-[var(--color-evolv-peach-soft)]",
    fill: "bg-gradient-to-r from-[var(--color-evolv-peach)] to-[var(--color-evolv-peach-muted)]",
  },
};

const heightStyles = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  color = "primary",
  height = "sm",
  showLabel = false,
  animated = true,
  className = "",
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const { track, fill } = colorStyles[color];

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
        className={["w-full rounded-[var(--radius-evolv-pill)] overflow-hidden", track, heightStyles[height]].join(" ")}
      >
        <div
          className={[
            "h-full rounded-[var(--radius-evolv-pill)]",
            fill,
            animated ? "transition-[width] duration-[var(--duration-evolv-xslow)] ease-out" : "",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-right text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
