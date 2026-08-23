/**
 * CompanionPlaceholder.tsx — Compatibility wrapper for VirtualCompanion.
 */
import { VirtualCompanion } from "../../features/companion/VirtualCompanion";
import type { CompanionState, PlayStyle } from "../../types";

interface CompanionPlaceholderProps {
  level?: number;
  totalXp?: number;
  state?: CompanionState;
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  playStyle?: PlayStyle;
  completedMissionsToday?: number;
  currentStreak?: number;
  className?: string;
  onTap?: () => void;
}

export function CompanionPlaceholder({
  level = 1,
  totalXp = 0,
  state = "idle",
  size = "md",
  interactive = true,
  playStyle = "casual-player",
  completedMissionsToday = 0,
  currentStreak = 1,
  className = "",
  onTap,
}: CompanionPlaceholderProps) {
  return (
    <VirtualCompanion
      level={level}
      totalXp={totalXp}
      state={state}
      size={size}
      interactive={interactive}
      playStyle={playStyle}
      completedMissionsToday={completedMissionsToday}
      currentStreak={currentStreak}
      className={className}
      onTap={onTap}
    />
  );
}
