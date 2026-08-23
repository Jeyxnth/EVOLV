/**
 * CentralStructureModal.tsx — Explores the player's Evolving Home Base progression.
 *
 * Implements:
 *  - Visual evolution path (Early -> Mid -> Advanced stages)
 *  - Clear indication of the currently active stage
 *  - Energy & Level thresholds required for subsequent upgrades
 *  - Contextual lore and play-style thematic resonance
 */
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { CentralStructureStage, PlayStyleWorldConfig } from "../../types";

interface CentralStructureModalProps {
  isOpen: boolean;
  worldConfig: PlayStyleWorldConfig;
  currentEnergy: number;
  currentLevel: number;
  onClose: () => void;
}

export function CentralStructureModal({
  isOpen,
  worldConfig,
  currentEnergy,
  currentLevel,
  onClose,
}: CentralStructureModalProps) {
  const { centralStructure, worldTheme } = worldConfig;
  const { stages, currentStage } = centralStructure;

  return (
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      title={centralStructure.baseName}
    >
      <div className="space-y-4 pt-1 pb-2">
        {/* Active Stage Hero Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-[var(--color-evolv-surface-raised)] to-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)] shadow-[var(--shadow-evolv-sm)]">
          <span className="text-4xl p-3 rounded-2xl bg-[var(--color-evolv-surface)] shadow-inner shrink-0 animate-bounce-subtle">
            {currentStage.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="mint" size="xs">
                Active Core (Stage {currentStage.stageNumber}/3)
              </Badge>
              <span className="text-[10px] text-[var(--color-evolv-muted)] font-medium">
                {worldTheme}
              </span>
            </div>
            <h3 className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] leading-tight truncate">
              {currentStage.name}
            </h3>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-0.5">
              {currentStage.subtitle}
            </p>
          </div>
        </div>

        {/* Description & Narrative */}
        <div className="p-3.5 rounded-xl bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border-soft)] space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-evolv-primary)]">
            Home Base Atmosphere
          </p>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-ink)] leading-relaxed italic">
            "{currentStage.description}"
          </p>
        </div>

        {/* Evolution Roadmap (3 Stages) */}
        <div className="space-y-2 pt-1">
          <p className="text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-ink)] uppercase tracking-wider">
            Evolution Roadmap
          </p>

          <div className="space-y-2.5">
            {stages.map((stageItem: CentralStructureStage) => {
              const isUnlocked =
                currentEnergy >= stageItem.minEnergy ||
                currentLevel >= stageItem.minLevel;
              const isCurrent = stageItem.stage === currentStage.stage;

              return (
                <div
                  key={stageItem.stage}
                  className={[
                    "p-3 rounded-2xl border transition-all flex items-start gap-3",
                    isCurrent
                      ? "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-primary)] shadow-[var(--shadow-evolv-sm)]"
                      : isUnlocked
                      ? "bg-[var(--color-evolv-surface-raised)] border-[var(--color-evolv-border-soft)] opacity-90"
                      : "bg-[var(--color-evolv-surface-raised)] border-dashed border-[var(--color-evolv-border)] opacity-60",
                  ].join(" ")}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--color-evolv-surface)] shrink-0">
                    {stageItem.icon}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[var(--text-evolv-xs)] text-[var(--color-evolv-ink)] leading-tight">
                        Stage {stageItem.stageNumber}: {stageItem.name}
                      </p>
                      <Badge
                        variant={isCurrent ? "primary" : isUnlocked ? "mint" : "neutral"}
                        size="xs"
                      >
                        {isCurrent ? "Current" : isUnlocked ? "Achieved" : `Requires ${stageItem.minEnergy}⚡`}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-evolv-muted)] leading-snug">
                      {stageItem.description}
                    </p>
                    {!isUnlocked && (
                      <div className="pt-1">
                        <ProgressBar
                          value={Math.min(100, Math.round((currentEnergy / Math.max(stageItem.minEnergy, 1)) * 100))}
                          color="primary"
                          height="xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
