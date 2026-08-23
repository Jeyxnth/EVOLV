/**
 * AvatarCard — displays the user's avatar, name, level, XP bar,
 * and companion side-by-side.
 *
 * Used in: Home header, Profile page
 */
import { LevelBadge } from "../ui/LevelBadge";
import { XPDisplay } from "../ui/XPDisplay";
import { CompanionPlaceholder } from "./CompanionPlaceholder";
import type { PlayStyle } from "../../types";

interface AvatarCardProps {
  displayName: string;
  level: number;
  totalXp: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  /** Initials shown in avatar circle — max 2 chars */
  initials?: string;
  compact?: boolean; // thin header version vs expanded card
  playStyle?: PlayStyle;
  completedMissionsToday?: number;
  currentStreak?: number;
  className?: string;
}

/** Soft pastel avatar colors cycling by level */
const avatarColors = [
  { bg: "var(--color-evolv-primary-soft)", text: "var(--color-evolv-primary)" },
  { bg: "var(--color-evolv-mint-soft)", text: "var(--color-evolv-mint-dark)" },
  { bg: "var(--color-evolv-sky-soft)", text: "var(--color-evolv-sky-dark)" },
  { bg: "var(--color-evolv-amber-soft)", text: "var(--color-evolv-amber-dark)" },
  { bg: "var(--color-evolv-peach-soft)", text: "var(--color-evolv-peach)" },
];

export function AvatarCard({
  displayName,
  level,
  totalXp,
  xpIntoCurrentLevel,
  xpToNextLevel,
  initials,
  compact = false,
  playStyle = "casual-player",
  completedMissionsToday = 0,
  currentStreak = 1,
  className = "",
}: AvatarCardProps) {
  const avatarColor = avatarColors[level % avatarColors.length];
  const displayInitials =
    initials ??
    displayName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  if (compact) {
    return (
      <div className={["flex items-center gap-3", className].join(" ")}>
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-[var(--text-evolv-sm)]"
            style={{ background: avatarColor.bg, color: avatarColor.text }}
            aria-label={`${displayName}'s avatar`}
          >
            {displayInitials}
          </div>
          <LevelBadge
            level={level}
            size="sm"
            className="absolute -bottom-1 -right-1"
          />
        </div>

        {/* Name + XP bar */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] truncate leading-tight">
            {displayName}
          </p>
          <XPDisplay
            totalXp={totalXp}
            level={level}
            xpIntoCurrentLevel={xpIntoCurrentLevel}
            xpToNextLevel={xpToNextLevel}
            compact
          />
        </div>

        {/* Companion */}
        <CompanionPlaceholder
          size="sm"
          level={level}
          totalXp={totalXp}
          playStyle={playStyle}
          completedMissionsToday={completedMissionsToday}
          currentStreak={currentStreak}
          interactive
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "flex items-start gap-4 p-4 rounded-[var(--radius-evolv-card)]",
        "bg-gradient-to-br from-[var(--color-evolv-surface)] to-[var(--color-evolv-surface-raised)]",
        "shadow-[var(--shadow-evolv-sm)] border border-[var(--color-evolv-border-soft)]",
        className,
      ].join(" ")}
    >
      {/* Avatar circle */}
      <div className="relative shrink-0">
        {/* Level ring */}
        <div
          className="w-16 h-16 rounded-full p-0.5"
          style={{
            background:
              "linear-gradient(135deg, var(--color-evolv-primary), var(--color-evolv-sky))",
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-display font-bold text-[var(--text-evolv-xl)]"
            style={{ background: avatarColor.bg, color: avatarColor.text }}
            aria-label={`${displayName}'s avatar`}
          >
            {displayInitials}
          </div>
        </div>
        <LevelBadge
          level={level}
          size="sm"
          className="absolute -bottom-1 -right-0.5"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pt-0.5 space-y-2">
        <div>
          <p className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] leading-tight truncate">
            {displayName}
          </p>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
            Wellbeing Explorer
          </p>
        </div>
        <XPDisplay
          totalXp={totalXp}
          level={level}
          xpIntoCurrentLevel={xpIntoCurrentLevel}
          xpToNextLevel={xpToNextLevel}
          compact
        />
      </div>

      {/* Companion alongside avatar */}
      <div className="shrink-0">
        <CompanionPlaceholder
          size="md"
          level={level}
          totalXp={totalXp}
          playStyle={playStyle}
          completedMissionsToday={completedMissionsToday}
          currentStreak={currentStreak}
          interactive
        />
      </div>
    </div>
  );
}
