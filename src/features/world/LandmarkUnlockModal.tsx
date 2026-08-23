/**
 * LandmarkUnlockModal.tsx — Celebratory modal when a world landmark/structure is unlocked.
 *
 * Implements Phase 11 Reward Feedback:
 *  - Clear, concise milestone feedback
 *  - Celebrates real-life action translating to visible world growth
 *  - Displays the unlocked structure icon, name, lore narrative, and realm theme
 */
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import type { WorldElement } from "../../types";

interface LandmarkUnlockModalProps {
  isOpen: boolean;
  element: WorldElement | null;
  worldTheme?: string;
  onClose: () => void;
}

export function LandmarkUnlockModal({
  isOpen,
  element,
  worldTheme = "Living World",
  onClose,
}: LandmarkUnlockModalProps) {
  if (!element) return null;

  return (
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      title="Landmark Materialized! 🌿"
    >
      <div className="flex flex-col items-center text-center space-y-4 pt-2 pb-1">
        {/* Animated Landmark Badge / Icon */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-lg border-2 border-white/60 animate-bounce-subtle"
            style={{ background: "var(--color-evolv-mint-soft)" }}
          >
            {element.icon}
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-evolv-mint)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-evolv-mint)]"></span>
          </span>
        </div>

        {/* Milestone info */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Badge variant="mint" size="xs">
              World Milestone
            </Badge>
            <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              {worldTheme}
            </span>
          </div>
          <h2 className="font-display font-bold text-[var(--text-evolv-xl)] text-[var(--color-evolv-ink)] leading-tight">
            {element.name}
          </h2>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] max-w-sm mx-auto leading-relaxed">
            {element.description}
          </p>
        </div>

        {/* Narrative lore box */}
        <div className="w-full bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)] rounded-2xl p-4 text-left space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-evolv-mint-dark)]">
            ✨ Realm Flourishing
          </p>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-ink)] leading-relaxed italic">
            "{element.narrativeUnlocked}"
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
            className="shadow-[var(--shadow-evolv-md)]"
          >
            Continue Journey
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
