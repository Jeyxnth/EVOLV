/**
 * WorldCanvas.tsx — Living 2D Game World Environment Canvas.
 *
 * Implements:
 *  - Evolving Central World Core / Home Base adapting to play style & progression stage
 *  - Connected terrain pathways linking the Core to surrounding landmarks
 *  - Clear visual distinction between Unlocked (vibrant) and Locked (silhouetted) landmarks
 *  - Responsive panoramic view on mobile, tablet, and desktop screens
 */
import type { PlayStyle, WorldElement } from "../../types";
import { WorldCoreBuilding, getCoreStage, getCoreStructureInfo } from "./WorldCoreBuilding";
import type { PlayStyleWorldConfig } from "../../types";

interface WorldCanvasProps {
  playStyle: PlayStyle;
  level: number;
  totalXp: number;
  realmEnergy: number;
  worldConfig: PlayStyleWorldConfig;
  elements: WorldElement[];
  onSelectElement: (el: WorldElement) => void;
  onSelectCore: () => void;
}

export function WorldCanvas({
  playStyle,
  level,
  realmEnergy,
  worldConfig,
  elements,
  onSelectElement,
  onSelectCore,
}: WorldCanvasProps) {
  const coreStage = getCoreStage(level, realmEnergy);
  const coreInfo = getCoreStructureInfo(playStyle, coreStage);

  // Position coordinates for up to 6 landmarks around the central core.
  // All positions use `left` percentages so that translate(-50%, -50%) correctly
  // centers the icon on the coordinate (mixing `right` with translateX(-50%) shifts
  // right-anchored landmarks off-screen to the right).
  const landmarkPositions = [
    { top: "62%", left: "8%",  zIndex: 12 },   // Far-left foreground
    { top: "38%", left: "20%", zIndex: 10 },   // Left mid
    { top: "30%", left: "38%", zIndex: 8  },   // Center-left upper
    { top: "30%", left: "62%", zIndex: 8  },   // Center-right upper
    { top: "40%", left: "80%", zIndex: 10 },   // Right mid
    { top: "62%", left: "92%", zIndex: 12 },   // Far-right foreground
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-evolv-card)] shadow-[var(--shadow-evolv-md)] border border-[var(--color-evolv-border-soft)] h-80 sm:h-96 md:h-[420px] lg:h-[460px] transition-all duration-700 select-none"
      aria-label={`Your ${worldConfig.worldTheme} evolving world`}
    >
      {/* ── 1. Sky Gradient Layer ── */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: worldConfig.skyGradient }}
      />

      {/* ── 2. Celestial Light Orb (Sun / Moon / Arcane Star) ── */}
      <div
        className="absolute top-6 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 rounded-full opacity-80 transition-transform duration-1000 pointer-events-none"
        style={{
          background: worldConfig.sunGlow,
          boxShadow: "0 0 50px 15px rgba(255,255,255,0.4)",
        }}
        aria-hidden="true"
      />

      {/* ── 3. Distant Hills Layer 3 ── */}
      <svg
        className="absolute bottom-0 w-full h-44 md:h-56 pointer-events-none"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 160 C200 110, 400 140, 600 120 C800 100, 920 135, 1000 115 L1000 300 L0 300 Z"
          fill={worldConfig.hillColors[0]}
          opacity="0.45"
        />
      </svg>

      {/* ── 4. Midground Terrain Layer 2 ── */}
      <svg
        className="absolute bottom-0 w-full h-36 md:h-48 pointer-events-none"
        viewBox="0 0 1000 250"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 130 C250 80, 450 120, 650 95 C850 70, 950 110, 1000 90 L1000 250 L0 250 Z"
          fill={worldConfig.hillColors[1]}
          opacity="0.65"
        />
      </svg>

      {/* ── 5. Connected Pathway Network (SVG trails connecting Core to Landmarks) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Pathway trails linking Center (50, 72) to each landmark point */}
        {/* Landmark 1: left 8%, top 62% → (8, 62) */}
        <path
          d="M 50 72 Q 30 70 8 68"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
        {/* Landmark 2: left 20%, top 38% → (20, 38) */}
        <path
          d="M 50 72 Q 35 55 20 44"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
        {/* Landmark 3: left 38%, top 30% → (38, 30) */}
        <path
          d="M 50 72 Q 44 50 38 36"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
        {/* Landmark 4: left 62%, top 30% → (62, 30) */}
        <path
          d="M 50 72 Q 56 50 62 36"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
        {/* Landmark 5: left 80%, top 40% → (80, 40) */}
        <path
          d="M 50 72 Q 65 56 80 46"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
        {/* Landmark 6: left 92%, top 62% → (92, 62) */}
        <path
          d="M 50 72 Q 72 70 92 68"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          fill="none"
        />
      </svg>


      {/* ── 6. Foreground Ground Layer 1 ── */}
      <svg
        className="absolute bottom-0 w-full h-28 md:h-36 pointer-events-none"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 90 C220 60, 480 95, 700 70 C880 50, 950 80, 1000 75 L1000 200 L0 200 Z"
          fill={worldConfig.hillColors[2]}
          opacity="0.9"
        />
      </svg>

      {/* ── 7. Surrounding Landmarks ── */}
      {elements.map((el, idx) => {
        const pos = landmarkPositions[idx % landmarkPositions.length];
        return (
          <div
            key={el.id}
            onClick={() => onSelectElement(el)}
            className={[
              "absolute flex flex-col items-center cursor-pointer select-none group transition-all duration-500",
              el.unlocked
                ? "opacity-100 hover:scale-110"
                : "opacity-45 filter grayscale hover:opacity-70",
            ].join(" ")}
            style={{
              top: pos.top,
              left: pos.left,
              zIndex: pos.zIndex,
              transform: "translate(-50%, -50%)",
            }}
            role="button"
            tabIndex={0}
            aria-label={`${el.name} (${el.unlocked ? "Restored" : `Locked: ${el.requiredEnergy} Energy`})`}
          >
            {/* Landmark Icon Card */}
            <div
              className={[
                "flex flex-col items-center justify-center p-2 md:p-2.5 rounded-2xl transition-all shadow-md",
                el.unlocked
                  ? "bg-white/90 dark:bg-slate-900/90 border border-white/80 dark:border-slate-700 shadow-md animate-fade-in-up"
                  : "bg-black/30 border border-dashed border-white/40 backdrop-blur-2xs",
              ].join(" ")}
            >
              <span className="text-2xl md:text-3xl filter drop-shadow-sm">
                {el.icon}
              </span>
            </div>

            {/* Label Pill */}
            <div className="mt-1 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
              {el.unlocked ? (
                <span>{el.name}</span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>{el.requiredEnergy}⚡</span>
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* ── 8. CENTRAL WORLD CORE / HOME BASE (The Evolving Heart of the Realm) ── */}
      <div
        className="absolute left-1/2 bottom-5 sm:bottom-6 md:bottom-8 -translate-x-1/2 z-20"
        style={{ transform: "translateX(-50%)" }}
      >
        <WorldCoreBuilding
          playStyle={playStyle}
          level={level}
          realmEnergy={realmEnergy}
          onClick={onSelectCore}
        />
      </div>

      {/* ── 9. World Region Badge (Top Left overlay) ── */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{worldConfig.regionName}</span>
        <span className="text-white/60 text-[10px]">• {coreInfo.stageName}</span>
      </div>
    </div>
  );
}
