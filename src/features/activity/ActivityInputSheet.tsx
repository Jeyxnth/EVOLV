/**
 * ActivityInputSheet.tsx - lightweight bottom-sheet for quick metric updates.
 *
 * Used from both HomePage and ProgressPage to let the student update one
 * activity metric at a time with simple +/- controls.
 * Saves to DailyActivity via db.ts.
 */
import { useState } from "react";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import type { DailyActivity, ActivityTargets } from "../../types";

export type ActivityMetric = "steps" | "walkingMinutes" | "runningMinutes" | "sleepHours" | "screenTimeHours" | "waterGlasses";

interface MetricConfig {
  label: string;
  icon: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  /** Encourage lower or higher values? */
  direction: "higher-is-better" | "lower-is-better";
  targetKey: keyof ActivityTargets;
  hint: string;
}

const METRIC_CONFIG: Record<ActivityMetric, MetricConfig> = {
  steps: {
    label: "Steps", icon: "👟", unit: "steps", step: 250, min: 0, max: 30000,
    direction: "higher-is-better", targetKey: "steps",
    hint: "Every step counts. Small goals build big habits.",
  },
  walkingMinutes: {
    label: "Walking", icon: "🚶", unit: "min", step: 5, min: 0, max: 180,
    direction: "higher-is-better", targetKey: "walkingMinutes",
    hint: "Even a 10-minute walk helps clear your mind.",
  },
  runningMinutes: {
    label: "Running", icon: "🏃", unit: "min", step: 5, min: 0, max: 120,
    direction: "higher-is-better", targetKey: "runningMinutes",
    hint: "Any pace that feels good is the right pace.",
  },
  sleepHours: {
    label: "Sleep", icon: "😴", unit: "h", step: 0.5, min: 0, max: 14,
    direction: "higher-is-better", targetKey: "sleepHours",
    hint: "Log last night's sleep. Consistent rest is everything.",
  },
  screenTimeHours: {
    label: "Screen time", icon: "📱", unit: "h", step: 0.5, min: 0, max: 16,
    direction: "lower-is-better", targetKey: "screenTimeHours",
    hint: "Awareness of screen time helps reduce it over time.",
  },
  waterGlasses: {
    label: "Water", icon: "💧", unit: "glasses", step: 1, min: 0, max: 20,
    direction: "higher-is-better", targetKey: "waterGlasses",
    hint: "A glass of water is one of the simplest things you can do.",
  },
};

interface ActivityInputSheetProps {
  metric: ActivityMetric;
  activity: DailyActivity;
  targets: ActivityTargets;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DailyActivity) => void;
  onUpdateTarget: (targets: ActivityTargets) => void;
}

export function ActivityInputSheet({
  metric,
  activity,
  targets,
  isOpen,
  onClose,
  onSave,
  onUpdateTarget,
}: ActivityInputSheetProps) {
  const cfg = METRIC_CONFIG[metric];
  const currentValue = (activity[metric] as number | undefined) ?? 0;
  const currentTarget = targets[cfg.targetKey] as number;

  const [value, setValue] = useState<number>(currentValue);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(currentTarget);

  const adjust = (delta: number) =>
    setValue(v => Math.min(cfg.max, Math.max(cfg.min, parseFloat((v + delta).toFixed(1)))));

  const adjustTarget = (delta: number) =>
    setTargetValue(v => Math.min(cfg.max * 1.5, Math.max(cfg.min, parseFloat((v + delta).toFixed(1)))));

  const handleSave = () => {
    const updated: DailyActivity = {
      ...activity,
      [metric]: value,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    if (editingTarget && targetValue !== currentTarget) {
      const updatedTargets: ActivityTargets = {
        ...targets,
        [cfg.targetKey]: targetValue,
        updatedAt: new Date().toISOString(),
      };
      onUpdateTarget(updatedTargets);
    }
    onClose();
  };

  const pct = cfg.direction === "lower-is-better"
    ? Math.round(Math.max(0, Math.min(100, ((currentTarget * 2 - value) / (currentTarget * 2)) * 100)))
    : Math.round(Math.min(100, (value / Math.max(currentTarget, 0.1)) * 100));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Update ${cfg.label}`}>
      <div className="space-y-5">
        {/* Metric display */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">{cfg.icon}</span>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] text-center leading-relaxed">
            {cfg.hint}
          </p>
        </div>

        {/* Value controller */}
        <div
          className="rounded-[var(--radius-evolv-card)] p-5"
          style={{ background: "var(--color-evolv-surface-raised)" }}
        >
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium text-center mb-3">
            Today&apos;s {cfg.label}
          </p>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => adjust(-cfg.step)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
              style={{
                background: "var(--color-evolv-border-soft)",
                color: "var(--color-evolv-muted)",
              }}
              aria-label={`Decrease ${cfg.label}`}
            >
              −
            </button>
            <div className="text-center">
              <p
                className="font-display font-extrabold leading-none"
                style={{ fontSize: "2.75rem", color: "var(--color-evolv-ink)" }}
              >
                {value}
              </p>
              <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] mt-0.5">{cfg.unit}</p>
            </div>
            <button
              type="button"
              onClick={() => adjust(cfg.step)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
              style={{
                background: "var(--color-evolv-primary-soft)",
                color: "var(--color-evolv-primary)",
              }}
              aria-label={`Increase ${cfg.label}`}
            >
              +
            </button>
          </div>

          {/* Progress vs target */}
          <div className="mt-4">
            <div className="flex justify-between text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mb-1.5">
              <span>vs. target ({cfg.direction === "lower-is-better" ? "≤" : ""}{targetValue} {cfg.unit})</span>
              <span className="font-semibold" style={{ color: pct >= 80 ? "var(--color-evolv-mint)" : "var(--color-evolv-primary)" }}>
                {pct}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-evolv-border-soft)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct >= 80 ? "var(--color-evolv-mint)" : "var(--color-evolv-primary)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Target editor */}
        <div>
          {!editingTarget ? (
            <button
              type="button"
              onClick={() => setEditingTarget(true)}
              className="w-full text-center text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] underline underline-offset-2"
            >
              Adjust my target ({targetValue} {cfg.unit})
            </button>
          ) : (
            <div
              className="rounded-[var(--radius-evolv-card)] p-4 space-y-3"
              style={{ background: "var(--color-evolv-amber-soft)" }}
            >
              <p className="text-[var(--text-evolv-xs)] font-semibold text-center"
                style={{ color: "var(--color-evolv-amber-dark)" }}>
                Your personal target
              </p>
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => adjustTarget(-cfg.step)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: "var(--color-evolv-surface)", color: "var(--color-evolv-muted)" }}>
                  −
                </button>
                <div className="text-center">
                  <p className="font-display font-bold text-[var(--text-evolv-2xl)]"
                    style={{ color: "var(--color-evolv-ink)" }}>{targetValue}</p>
                  <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">{cfg.unit}</p>
                </div>
                <button type="button" onClick={() => adjustTarget(cfg.step)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: "var(--color-evolv-surface)", color: "var(--color-evolv-amber)" }}>
                  +
                </button>
              </div>
              <p className="text-[var(--text-evolv-xs)] text-center" style={{ color: "var(--color-evolv-amber-dark)" }}>
                Targets are yours to set. No pressure.
              </p>
            </div>
          )}
        </div>

        {/* Save button */}
        <Button variant="primary" fullWidth onClick={handleSave}>
          Save
        </Button>
      </div>
    </BottomSheet>
  );
}
