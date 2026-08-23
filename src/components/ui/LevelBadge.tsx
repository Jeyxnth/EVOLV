/**
 * LevelBadge — displays the user's current level in a styled pill.
 * Used in the avatar area, nav, and profile views.
 */
interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-5 min-w-[1.25rem] text-[var(--text-evolv-xs)] px-1.5",
  md: "h-6 min-w-[1.5rem] text-[var(--text-evolv-sm)] px-2",
  lg: "h-8 min-w-[2rem] text-[var(--text-evolv-base)] px-3",
};

export function LevelBadge({ level, size = "md", className = "" }: LevelBadgeProps) {
  return (
    <span
      aria-label={`Level ${level}`}
      className={[
        "inline-flex items-center justify-center rounded-[var(--radius-evolv-pill)]",
        "font-display font-bold",
        "bg-gradient-to-br from-[var(--color-evolv-primary)] to-[var(--color-evolv-sky)]",
        "text-white shadow-[var(--shadow-evolv-sm)]",
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {level}
    </span>
  );
}
