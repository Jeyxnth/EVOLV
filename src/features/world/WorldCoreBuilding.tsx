/**
 * WorldCoreBuilding.tsx — Evolving Central Home Base / World Core Component.
 *
 * Replaces the old floating purple blob with an authentic, play-style-tailored
 * central structure that visibly evolves across 3 developmental stages:
 *  - Stage 1 (Early: Lvl 1-2, 0-49 RE): Humble outpost / hearth / dais
 *  - Stage 2 (Mid: Lvl 3-5, 50-139 RE): Established lodge / keep / academy / cottage
 *  - Stage 3 (Advanced: Lvl 6+, 140+ RE): Grand citadel / temple / estate / observatory
 */
import type { PlayStyle } from "../../types";

export type CoreStage = "early" | "mid" | "advanced";

export function getCoreStage(level: number, realmEnergy: number): CoreStage {
  if (level >= 6 || realmEnergy >= 140) return "advanced";
  if (level >= 3 || realmEnergy >= 50) return "mid";
  return "early";
}

interface CoreStructureInfo {
  title: string;
  stageName: string;
  icon: string;
  description: string;
}

export function getCoreStructureInfo(playStyle: PlayStyle, stage: CoreStage): CoreStructureInfo {
  switch (playStyle) {
    case "explorer-builder":
      if (stage === "advanced") {
        return {
          title: "Valley Treehouse Citadel",
          stageName: "Stage 3 — Flourishing Canopy",
          icon: "🏰",
          description: "A sprawling multi-level canopy sanctuary with arched suspension bridges and crystal lanterns.",
        };
      }
      if (stage === "mid") {
        return {
          title: "Pine Ridge Timber Lodge",
          stageName: "Stage 2 — Established Outpost",
          icon: "🏡",
          description: "A two-story cedar timber lodge with a watchtower telescope and stone-paved trail.",
        };
      }
      return {
        title: "Wilderness Explorer Camp",
        stageName: "Stage 1 — Base Outpost",
        icon: "🏕️",
        description: "A cozy campfire, field expedition tent, and wooden map table charting new lands.",
      };

    case "puzzle-explorer":
      if (stage === "advanced") {
        return {
          title: "Sunken Arcane Temple",
          stageName: "Stage 3 — Awakened Sanctum",
          icon: "🏛️",
          description: "A towering illuminated obelisk with orbiting concentric rune rings and starlight beams.",
        };
      }
      if (stage === "mid") {
        return {
          title: "Focus Rune Portal",
          stageName: "Stage 2 — Restored Portal",
          icon: "🔮",
          description: "A restored stone archway framing a floating amethyst crystal and glowing floor glyphs.",
        };
      }
      return {
        title: "Ancient Rune Dais",
        stageName: "Stage 1 — Sealed Relic",
        icon: "🪨",
        description: "An ancient weathered stone dais with carved runic tablets waiting to be decoded.",
      };

    case "quiz-master":
      if (stage === "advanced") {
        return {
          title: "Grand Stargazer Observatory",
          stageName: "Stage 3 — Celestial Dome",
          icon: "🔭",
          description: "A soaring domed celestial academy with rotating brass armillary spheres and wisdom spires.",
        };
      }
      if (stage === "mid") {
        return {
          title: "Study Pavilion & Archives",
          stageName: "Stage 2 — Grand Library",
          icon: "📚",
          description: "A columned marble pavilion housing scroll archives, astrolabes, and quiet study alcoves.",
        };
      }
      return {
        title: "Scholar's Open Dais",
        stageName: "Stage 1 — Foundation Desk",
        icon: "📖",
        description: "A marble stone dais with open parchment scrolls, brass compass, and lantern.",
      };

    case "casual-player":
      if (stage === "advanced") {
        return {
          title: "Flourishing Blossom Estate",
          stageName: "Stage 3 — Sanctuary Haven",
          icon: "🏮",
          description: "A fairytale timber villa with glowing lantern windows, thermal hot springs, and tea trellis.",
        };
      }
      if (stage === "mid") {
        return {
          title: "Hearthside Timber Cottage",
          stageName: "Stage 2 — Cozy Hearth",
          icon: "🏡",
          description: "A warm stone-and-timber cottage with smoking chimney, wooden fence, and herbal gardens.",
        };
      }
      return {
        title: "Wildflower Hearth Clearing",
        stageName: "Stage 1 — Peaceful Hearth",
        icon: "🌸",
        description: "A stone outdoor hearth, picnic mat with warm tea, and potted wild chamomile.",
      };

    case "competitor":
    default:
      if (stage === "advanced") {
        return {
          title: "Champion's Crown Citadel",
          stageName: "Stage 3 — Iron Bastion",
          icon: "🏆",
          description: "A colossal iron-and-gold fortress with roaring flame beacons and golden eagle standards.",
        };
      }
      if (stage === "mid") {
        return {
          title: "Fortress Keep of Discipline",
          stageName: "Stage 2 — Fortified Keep",
          icon: "🏰",
          description: "A heavy stone fortress with iron braziers, high battlements, and weapon training racks.",
        };
      }
      return {
        title: "Warrior's Training Dais",
        stageName: "Stage 1 — Proving Ground",
        icon: "🥋",
        description: "A stone combat ring with training dummy and crimson battle standard on stone cairn.",
      };
  }
}

interface WorldCoreBuildingProps {
  playStyle: PlayStyle;
  level: number;
  realmEnergy: number;
  onClick?: () => void;
  className?: string;
}

export function WorldCoreBuilding({
  playStyle,
  level,
  realmEnergy,
  onClick,
  className = "",
}: WorldCoreBuildingProps) {
  const stage = getCoreStage(level, realmEnergy);
  const info = getCoreStructureInfo(playStyle, stage);

  return (
    <div
      onClick={onClick}
      className={[
        "relative flex flex-col items-center justify-center cursor-pointer select-none group transition-transform duration-500 hover:scale-105",
        className,
      ].join(" ")}
      role="button"
      tabIndex={0}
      aria-label={`${info.title} (${info.stageName})`}
    >
      {/* Dynamic Ambient Glow corresponding to stage */}
      <div
        className={[
          "absolute -inset-4 rounded-full pointer-events-none transition-all duration-700 blur-md opacity-60",
          stage === "advanced"
            ? "bg-amber-300/40 animate-pulse"
            : stage === "mid"
            ? "bg-emerald-300/35"
            : "bg-sky-200/25",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Building Artwork Card */}
      <div className="relative flex flex-col items-center p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-white/60 dark:border-slate-700/60">
        <span className="text-4xl md:text-5xl filter drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1">
          {info.icon}
        </span>

        {/* Stage Badge & Title */}
        <div className="mt-1.5 flex flex-col items-center text-center">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300/50">
            {stage === "advanced" ? "Tier III Citadel" : stage === "mid" ? "Tier II Lodge" : "Tier I Base"}
          </span>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 mt-1 whitespace-nowrap drop-shadow-xs">
            {info.title}
          </span>
        </div>

        {/* Tiny subtle level indicator */}
        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Level {level} • {realmEnergy}⚡
        </span>
      </div>

      {/* Visual stone base shadow */}
      <div
        className="w-20 h-3 rounded-[100%] bg-black/20 blur-2xs mt-1"
        aria-hidden="true"
      />
    </div>
  );
}
