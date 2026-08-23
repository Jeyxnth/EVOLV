/**
 * LevelUpModal.tsx — Pleasant, therapeutic level-up moment in EVOLV.
 *
 * Appears when a student crosses into a new level.
 * Designed to feel warm, rewarding, and encouraging without aggressive casino effects.
 */
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { LevelBadge } from "../../components/ui/LevelBadge";
import type { PlayStyle } from "../../types";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  totalXp: number;
  playStyle?: PlayStyle | null;
  onClose: () => void;
}

export function LevelUpModal({
  isOpen,
  newLevel,
  totalXp,
  playStyle = "casual-player",
  onClose,
}: LevelUpModalProps) {
  const getPlayStyleEncouragement = (style?: PlayStyle | null): string => {
    switch (style) {
      case "puzzle-explorer":
        return "Your curiosity has unlocked new clarity and deeper mysteries.";
      case "quiz-master":
        return "Your daily knowledge checks are turning into solid habits.";
      case "competitor":
        return "New personal milestone reached. Keep building that momentum.";
      case "explorer-builder":
        return "Your world thrives with every step. New vitality is flowing in.";
      case "casual-player":
      default:
        return "Every mindful step counts. You are growing at your own perfect pace.";
    }
  };

  return (
    <BottomSheet open={isOpen} onClose={onClose} title="✨ LEVEL UP">
      <div className="space-y-5 pt-2 pb-1 text-center">
        {/* Level badge glow */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--color-evolv-amber-soft) 0%, var(--color-evolv-peach-soft) 100%)",
              border: "2px solid var(--color-evolv-amber)",
            }}
          >
            <span className="text-4xl">🌟</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={newLevel} size="md" />
            <span className="font-display font-extrabold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)]">
              Level {newLevel}
            </span>
          </div>
        </div>

        {/* Motivational note */}
        <div
          className="rounded-[var(--radius-evolv-card)] p-4"
          style={{ background: "var(--color-evolv-surface-raised)" }}
        >
          <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] mb-1">
            Congratulations on your growth!
          </p>
          <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] leading-relaxed">
            {getPlayStyleEncouragement(playStyle)}
          </p>
          <div className="mt-3 pt-3 border-t border-[var(--color-evolv-border-soft)] flex items-center justify-center gap-2 text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
            <span>Total earned:</span>
            <span className="font-bold text-[var(--color-evolv-amber-dark)]">
              {totalXp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Continue button */}
        <Button variant="primary" fullWidth size="lg" onClick={onClose}>
          Continue Journey ✨
        </Button>
      </div>
    </BottomSheet>
  );
}
