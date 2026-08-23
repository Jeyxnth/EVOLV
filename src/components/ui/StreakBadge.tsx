/**
 * StreakBadge — displays the current streak count with a flame icon.
 * Flexible streak: shows "active N of 7" sub-label when windowDays provided.
 */
interface StreakBadgeProps {
  streak: number;
  activeDaysInWindow?: number;
  windowDays?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { icon: "text-base", count: "text-[var(--text-evolv-sm)]", sub: "hidden" },
  md: { icon: "text-xl", count: "text-[var(--text-evolv-lg)]", sub: "text-[var(--text-evolv-xs)]" },
  lg: { icon: "text-3xl", count: "text-[var(--text-evolv-2xl)]", sub: "text-[var(--text-evolv-sm)]" },
};

export function StreakBadge({
  streak,
  activeDaysInWindow,
  windowDays,
  size = "md",
  className = "",
}: StreakBadgeProps) {
  const { icon, count, sub } = sizeMap[size];
  const showWindow = activeDaysInWindow !== undefined && windowDays !== undefined;

  return (
    <div
      className={["flex items-center gap-1.5", className].join(" ")}
      aria-label={`${streak} day streak`}
    >
      <span className={[icon, "leading-none"].join(" ")} role="img" aria-hidden="true">
        🔥
      </span>
      <div className="leading-none">
        <span className={["font-display font-bold text-[var(--color-evolv-amber)]", count].join(" ")}>
          {streak}
        </span>
        {showWindow && (
          <p className={["text-[var(--color-evolv-muted)] font-medium mt-0.5", sub].join(" ")}>
            {activeDaysInWindow}/{windowDays} days active
          </p>
        )}
      </div>
    </div>
  );
}
