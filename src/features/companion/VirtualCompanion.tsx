/**
 * VirtualCompanion.tsx — Interactive, animated 2D companion component.
 *
 * Implements Phase 10 Virtual Companion:
 *  - 3 Developmental Stages: Seedling -> Budding -> Flourishing
 *  - Responsive States: Idle, Happy, Excited, Encouraging, Resting
 *  - Interactive Tap: Shows a floating speech bubble with therapeutic encouragement
 *  - Non-punitive, cute, and calming Pokémon GO-style presence
 */
import { useState, useEffect } from "react";
import {
  getCompanionData,
  getCompanionEncouragement,
} from "./companionEngine";
import type { CompanionState, PlayStyle } from "../../types";

interface VirtualCompanionProps {
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

const sizeConfig = {
  sm: {
    container: "w-10 h-10",
    glow: "w-14 h-14",
    body: "w-8 h-8",
    eye: "w-1.5 h-1.5",
    eyeGap: "gap-1.5",
    leafSize: "text-xs -top-2",
    sparkleSize: "text-xs",
  },
  md: {
    container: "w-14 h-14",
    glow: "w-20 h-20",
    body: "w-12 h-12",
    eye: "w-2 h-2",
    eyeGap: "gap-2",
    leafSize: "text-sm -top-3",
    sparkleSize: "text-sm",
  },
  lg: {
    container: "w-20 h-20",
    glow: "w-28 h-28",
    body: "w-16 h-16",
    eye: "w-2.5 h-2.5",
    eyeGap: "gap-2.5",
    leafSize: "text-base -top-3.5",
    sparkleSize: "text-base",
  },
  xl: {
    container: "w-28 h-28",
    glow: "w-36 h-36",
    body: "w-22 h-22",
    eye: "w-3 h-3",
    eyeGap: "gap-3",
    leafSize: "text-xl -top-5",
    sparkleSize: "text-lg",
  },
};

export function VirtualCompanion({
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
}: VirtualCompanionProps) {
  const [internalState, setInternalState] = useState<CompanionState>(state);
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechTimer, setSpeechTimer] = useState<number | null>(null);

  // Sync external state changes
  useEffect(() => {
    setInternalState(state);
  }, [state]);

  const companion = getCompanionData(level, totalXp, internalState);
  const cfg = sizeConfig[size];

  const handleCompanionTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;

    // Trigger cheerful happy state briefly
    setInternalState("happy");
    setTimeout(() => {
      setInternalState("idle");
    }, 1600);

    const message = getCompanionEncouragement(companion, {
      completedMissionsToday,
      currentStreak,
      playStyle,
    });
    setSpeech(message);

    if (speechTimer) clearTimeout(speechTimer);
    const timer = window.setTimeout(() => {
      setSpeech(null);
    }, 4000);
    setSpeechTimer(timer);

    onTap?.();
  };

  // Dynamic animation class based on companion state
  let motionClass = "animate-companion-float";
  if (internalState === "happy" || internalState === "excited") {
    motionClass = "animate-bounce";
  } else if (internalState === "resting") {
    motionClass = "animate-pulse";
  }

  return (
    <div
      className={["relative flex flex-col items-center justify-center select-none", className].join(" ")}
      onClick={handleCompanionTap}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${companion.name}, your ${companion.stageTitle} companion`}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      {/* Speech Bubble (when tapped) */}
      {speech && (
        <div
          className="absolute -top-14 left-1/2 z-50 px-3.5 py-2 rounded-2xl bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-md)] border border-[var(--color-evolv-border)] text-[var(--color-evolv-ink)] text-[var(--text-evolv-xs)] font-medium w-max min-w-[180px] max-w-[260px] whitespace-normal leading-relaxed text-center animate-fade-in-up pointer-events-none"
          style={{ transform: "translate(-50%, -10px)" }}
        >
          {speech}
          {/* Arrow */}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-evolv-surface)] border-r border-b border-[var(--color-evolv-border)] rotate-45"
            aria-hidden="true"
          />
        </div>
      )}

      <div className={["relative flex items-center justify-center", cfg.container].join(" ")}>
        {/* Glow halo behind companion */}
        <div
          className={["absolute rounded-full pointer-events-none transition-all duration-700", cfg.glow].join(" ")}
          style={{
            background:
              companion.stage === "flourishing"
                ? "radial-gradient(circle, rgba(142, 222, 196, 0.45) 0%, rgba(120, 190, 255, 0.25) 50%, transparent 75%)"
                : companion.stage === "budding"
                ? "radial-gradient(circle, rgba(168, 230, 207, 0.4) 0%, transparent 70%)"
                : "radial-gradient(circle, var(--color-evolv-primary-soft) 0%, transparent 70%)",
            boxShadow:
              internalState === "excited"
                ? "0 0 25px 8px rgba(108, 92, 231, 0.35)"
                : undefined,
          }}
          aria-hidden="true"
        />

        {/* Orbiting Sparkles for Flourishing Stage */}
        {companion.stage === "flourishing" && (
          <div className="absolute inset-0 animate-spin pointer-events-none" style={{ animationDuration: "12s" }}>
            <span className={["absolute -top-1 left-1/2 -translate-x-1/2", cfg.sparkleSize].join(" ")}>✨</span>
            <span className={["absolute -bottom-1 right-0", cfg.sparkleSize].join(" ")}>🌸</span>
          </div>
        )}

        {/* Companion Body */}
        <div
          className={[
            "relative rounded-full transition-transform duration-300 flex items-center justify-center",
            motionClass,
            cfg.body,
          ].join(" ")}
          style={{
            background:
              companion.stage === "flourishing"
                ? "radial-gradient(circle at 35% 35%, #a8e6cf, #6c5ce7 85%)"
                : companion.stage === "budding"
                ? "radial-gradient(circle at 35% 35%, #9fe4c4, #57a99a 85%)"
                : "radial-gradient(circle at 35% 35%, var(--color-evolv-primary-muted), var(--color-evolv-primary))",
            boxShadow: "0 6px 16px rgba(108, 92, 231, 0.25)",
          }}
        >
          {/* Sprout Crest on Head for Budding / Flourishing */}
          {(companion.stage === "budding" || companion.stage === "flourishing") && (
            <span
              className={["absolute font-bold select-none pointer-events-none", cfg.leafSize].join(" ")}
              aria-hidden="true"
            >
              {companion.stage === "flourishing" ? "🌸" : "🌱"}
            </span>
          )}

          {/* Eyes */}
          <div className={["flex items-center justify-center", cfg.eyeGap].join(" ")}>
            {internalState === "happy" || internalState === "excited" ? (
              // Happy curved eyes ^^
              <>
                <span className="text-white font-bold text-xs select-none leading-none">^</span>
                <span className="text-white font-bold text-xs select-none leading-none">^</span>
              </>
            ) : (
              // Normal rounded glowing eyes
              <>
                <div className={["rounded-full bg-white/90 shadow-sm", cfg.eye].join(" ")} />
                <div className={["rounded-full bg-white/90 shadow-sm", cfg.eye].join(" ")} />
              </>
            )}
          </div>

          {/* Cheeks blush (subtle) */}
          <div className="absolute bottom-2.5 flex justify-between w-3/5 px-0.5 pointer-events-none opacity-60">
            <div className="w-1.5 h-1 rounded-full bg-pink-300" />
            <div className="w-1.5 h-1 rounded-full bg-pink-300" />
          </div>

          {/* Light reflection highlight */}
          <div
            className="absolute top-1.5 left-2 w-2 h-1.5 rounded-full bg-white/50"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
