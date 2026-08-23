/**
 * PlayStyleSelectorSheet.tsx - BottomSheet to view and switch play style.
 *
 * Used from ProfilePage (and any settings surface) to let the student switch
 * their active play style anytime. Preserves all health data, goal progress,
 * and mission history while immediately transforming presentation.
 */
import { useState } from "react";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { PLAY_STYLE_CONFIGS } from "./playStyleAdapter";
import type { PlayStyle } from "../../types";

interface PlayStyleSelectorSheetProps {
  currentPlayStyle: PlayStyle;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (newPlayStyle: PlayStyle) => Promise<void> | void;
}

const PLAY_STYLE_LIST: PlayStyle[] = [
  "puzzle-explorer",
  "quiz-master",
  "casual-player",
  "competitor",
  "explorer-builder",
];

export function PlayStyleSelectorSheet({
  currentPlayStyle,
  isOpen,
  onClose,
  onSelect,
}: PlayStyleSelectorSheetProps) {
  const [selected, setSelected] = useState<PlayStyle>(currentPlayStyle);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSelect(selected);
      onClose();
    } catch (err) {
      console.error("[PlayStyleSelector] Error changing play style:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Choose Your Play Style">
      <div className="space-y-4 pt-1">
        <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
          Your wellbeing goals stay exactly the same. Only the way your missions are framed and celebrated changes.
        </p>

        <div className="space-y-2.5">
          {PLAY_STYLE_LIST.map((styleKey) => {
            const cfg = PLAY_STYLE_CONFIGS[styleKey];
            const isSelected = selected === styleKey;
            const isCurrent = currentPlayStyle === styleKey;

            return (
              <div
                key={styleKey}
                onClick={() => setSelected(styleKey)}
                className="p-3.5 rounded-[var(--radius-evolv-card)] border transition-all cursor-pointer press-scale"
                style={{
                  background: isSelected ? cfg.cardBg : "var(--color-evolv-surface)",
                  borderColor: isSelected ? cfg.accentBorder : "var(--color-evolv-border-soft)",
                  boxShadow: isSelected ? "var(--shadow-evolv-sm)" : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cfg.emoji}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] leading-snug">
                          {cfg.label}
                        </p>
                        {isCurrent && (
                          <Badge variant="mint" size="xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-[var(--text-evolv-xs)] font-medium text-[var(--color-evolv-muted)]">
                        {cfg.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Radio circle */}
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      borderColor: isSelected ? cfg.accentBorder : "var(--color-evolv-border)",
                      background: isSelected ? cfg.accentBorder : "transparent",
                    }}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white block" />
                    )}
                  </div>
                </div>

                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-2 leading-relaxed">
                  {cfg.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            fullWidth
            loading={saving}
            disabled={saving}
            onClick={handleSave}
          >
            Apply Play Style
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
