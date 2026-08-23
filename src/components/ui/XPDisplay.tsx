/**
 * XPDisplay — shows XP total, progress bar within current level,
 * and the level label.
 *
 * Can be rendered in compact (inline) or expanded (card) mode.
 */
import { ProgressBar } from "./ProgressBar";
import { LevelBadge } from "./LevelBadge";

interface XPDisplayProps {
  totalXp: number;
  level: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  compact?: boolean;  // true = single-line inline summary
  className?: string;
}

export function XPDisplay({
  totalXp,
  level,
  xpIntoCurrentLevel,
  xpToNextLevel,
  compact = false,
  className = "",
}: XPDisplayProps) {
  if (compact) {
    return (
      <div className={["flex items-center gap-2", className].join(" ")}>
        <LevelBadge level={level} size="sm" />
        <div className="flex-1 min-w-0">
          <ProgressBar
            value={xpIntoCurrentLevel}
            max={xpToNextLevel}
            color="amber"
            height="xs"
            label={`XP progress: ${xpIntoCurrentLevel} of ${xpToNextLevel}`}
          />
        </div>
        <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium whitespace-nowrap">
          {xpIntoCurrentLevel}<span className="opacity-50">/{xpToNextLevel}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={["space-y-2", className].join(" ")}>
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <LevelBadge level={level} size="md" />
          <div>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium uppercase tracking-wide">
              Level {level}
            </p>
            <p className="font-display text-[var(--text-evolv-xl)] font-bold text-[var(--color-evolv-ink)] leading-none">
              {totalXp.toLocaleString()}
              <span className="text-[var(--text-evolv-sm)] font-semibold text-[var(--color-evolv-muted)] ml-1">XP</span>
            </p>
          </div>
        </div>
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
          {xpIntoCurrentLevel}/{xpToNextLevel} to next
        </p>
      </div>
      <ProgressBar
        value={xpIntoCurrentLevel}
        max={xpToNextLevel}
        color="amber"
        height="md"
        label="XP progress to next level"
      />
    </div>
  );
}
