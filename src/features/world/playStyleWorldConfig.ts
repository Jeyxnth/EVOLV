/**
 * playStyleWorldConfig.ts — Centralized play-style-specific world configurations.
 *
 * Implements:
 *  - Distinct visual themes, sky gradients, and hill colors per play style
 *  - Per-play-style terrain SVG path profiles (distinct shapes, not just colors)
 *  - Ambient floating decorative elements per play style
 *  - Evolving Central World Structures (Early -> Mid -> Advanced stages)
 *  - Tailored unlockable world elements with required Realm Energy and Level
 *  - Progression narratives and milestones matching each player's play style
 */
import type { PlayStyle, PlayStyleWorldConfig, WorldElement, CentralStructureStage } from "../../types";

export interface TerrainPaths {
  /** Far background layer (mountains / distant silhouette) */
  far: string;
  /** Mid-ground layer (rolling hills / terrain) */
  mid: string;
  /** Foreground layer (ground / base) */
  foreground: string;
}

export interface AmbientElement {
  emoji: string;
  /** CSS left % */
  left: string;
  /** CSS bottom % */
  bottom: string;
  /** Tailwind animation class e.g. animate-bounce, animate-pulse, animate-spin */
  animation: string;
  /** Opacity 0-1 */
  opacity: number;
  /** Font size in rem */
  size: number;
}

interface BasePlayStyleConfig {
  playStyle: PlayStyle;
  regionName: string;
  worldTheme: string;
  tagline: string;
  skyGradient: string;
  sunGlow: string;
  /** Position of celestial orb from the right (CSS %) */
  sunPosition: { top: string; right: string };
  hillColors: [string, string, string];
  /** Distinct SVG terrain path shapes per play style */
  terrainPaths: TerrainPaths;
  /** Floating ambient decorative elements */
  ambientElements: AmbientElement[];
  centralStructure: {
    baseName: string;
    stages: CentralStructureStage[];
  };
  milestoneTitle: string;
  progressionNote: string;
  elements: WorldElement[];
}

export const PLAY_STYLE_WORLDS: Record<PlayStyle, BasePlayStyleConfig> = {
  // ── 1. Explorer / Adventure (Explorer-Builder) ──
  "explorer-builder": {
    playStyle: "explorer-builder",
    regionName: "The Living Valley",
    worldTheme: "Verdant Fantasy Nature Sanctuary",
    tagline: "Your real-world movement breathes life into an expanding wilderness.",
    skyGradient: "linear-gradient(180deg, #bbf2f6 0%, #d8f3dc 40%, #e8f5e9 75%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #fff7b3, #f5c842)",
    sunPosition: { top: "8%", right: "8%" },
    hillColors: ["#81c784", "#66bb6a", "#48bb78"],
    // Gentle rolling organic hills — nature valley feeling
    terrainPaths: {
      far: "M0 75 L60 45 L130 68 L200 35 L280 62 L360 38 L430 65 L480 50 L480 140 L0 140 Z",
      mid: "M0 60 C90 35, 170 65, 240 45 C320 25, 410 55, 480 40 L480 120 L0 120 Z",
      foreground: "M0 38 C80 22, 180 42, 270 30 C350 20, 420 38, 480 32 L480 90 L0 90 Z",
    },
    ambientElements: [
      { emoji: "🌿", left: "12%", bottom: "32%", animation: "animate-pulse", opacity: 0.7, size: 0.9 },
      { emoji: "🦋", left: "35%", bottom: "55%", animation: "animate-bounce", opacity: 0.65, size: 0.8 },
      { emoji: "🌸", left: "68%", bottom: "40%", animation: "animate-pulse", opacity: 0.6, size: 0.85 },
      { emoji: "🍃", left: "82%", bottom: "60%", animation: "animate-bounce", opacity: 0.55, size: 0.75 },
    ],
    centralStructure: {
      baseName: "Arboreal Explorer Basecamp",
      stages: [
        {
          stage: "early",
          stageNumber: 1,
          name: "Trailhead Camp",
          subtitle: "Rustic Expedition Shelter",
          icon: "⛺",
          description: "A cozy shelter and trail maps pitched by the forest edge.",
          minEnergy: 0,
          minLevel: 1,
        },
        {
          stage: "mid",
          stageNumber: 2,
          name: "Timber Lodge & Outpost",
          subtitle: "Elevated Discovery Watchtower",
          icon: "🏡",
          description: "A sturdy timber outpost with elevated lookout perches and suspension rope bridges.",
          minEnergy: 40,
          minLevel: 3,
        },
        {
          stage: "advanced",
          stageNumber: 3,
          name: "Grand Arboreal Sanctuary",
          subtitle: "Monumental Sky Tree Haven",
          icon: "🌳",
          description: "A monumental ancient living sky-tree woven with hanging lanterns and crystal waterfalls.",
          minEnergy: 120,
          minLevel: 6,
        },
      ],
    },
    milestoneTitle: "Wilderness Restoration",
    progressionNote: "Every completed mission channels vitality into natural landmarks.",
    elements: [
      {
        id: "exp-1",
        name: "Meadow Sproutlands",
        icon: "🌱",
        requiredEnergy: 0,
        requiredLevel: 1,
        description: "Lush green grass and wild clover waking up with morning dew.",
        narrativeUnlocked: "The foundational soil has sprouted with vibrant new grass.",
        unlocked: true,
        color: "mint",
      },
      {
        id: "exp-2",
        name: "Whispering Brook",
        icon: "🌊",
        requiredEnergy: 20,
        requiredLevel: 2,
        description: "A crystal-clear natural stream flowing from mountain snowmelt.",
        narrativeUnlocked: "Clean running water now revitalizes the entire meadow.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "exp-3",
        name: "Ancient Sun Birch",
        icon: "🌳",
        requiredEnergy: 50,
        requiredLevel: 3,
        description: "A towering golden birch tree sheltering woodland creatures.",
        narrativeUnlocked: "A great birch stands tall, branching out toward the sun.",
        unlocked: false,
        color: "mint",
      },
      {
        id: "exp-4",
        name: "Moonstone Bridge",
        icon: "🌉",
        requiredEnergy: 90,
        requiredLevel: 4,
        description: "An elegant arching stone bridge crossing into higher peaks.",
        narrativeUnlocked: "The Moonstone Bridge is restored, opening alpine trails.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "exp-5",
        name: "Eagle's Ridge Lookout",
        icon: "🦅",
        requiredEnergy: 140,
        requiredLevel: 6,
        description: "A panoramic cliffside path overlooking the vast living valley.",
        narrativeUnlocked: "High mountain vistas now grant breathtaking clarity.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "exp-6",
        name: "Celestial Sun Pinnacle",
        icon: "☀️",
        requiredEnergy: 200,
        requiredLevel: 8,
        description: "The crowning mountain summit illuminated by eternal golden light.",
        narrativeUnlocked: "The pinnacle sanctuary shines with maximum flourishing life.",
        unlocked: false,
        color: "amber",
      },
    ],
  },

  // ── 2. Puzzle / Challenge (Puzzle-Explorer) ──
  "puzzle-explorer": {
    playStyle: "puzzle-explorer",
    regionName: "The Sunken Citadel",
    worldTheme: "Ancient Mystical Relic Ruins",
    tagline: "Every daily habit decodes enigmatic ruins and restores ancient mechanisms.",
    skyGradient: "linear-gradient(180deg, #2d1b69 0%, #6b3fa0 30%, #9d72c8 60%, #dcd6f7 85%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #e0c3fc, #8e44ad)",
    sunPosition: { top: "10%", right: "12%" },
    hillColors: ["#4a2080", "#7c6cf0", "#6c5ce7"],
    // Angular, stepped silhouettes — broken ruins, jutting spires
    terrainPaths: {
      far: "M0 100 L40 70 L80 90 L110 50 L145 75 L180 45 L220 80 L255 40 L295 65 L340 35 L380 60 L415 30 L450 55 L480 45 L480 140 L0 140 Z",
      mid: "M0 80 L30 55 L70 72 L100 42 L140 62 L175 35 L215 58 L255 32 L290 55 L330 28 L370 50 L410 38 L450 52 L480 42 L480 120 L0 120 Z",
      foreground: "M0 55 L25 38 L60 50 L90 28 L130 45 L165 22 L200 40 L240 20 L275 38 L310 18 L345 35 L385 16 L420 32 L460 24 L480 30 L480 90 L0 90 Z",
    },
    ambientElements: [
      { emoji: "💎", left: "18%", bottom: "48%", animation: "animate-pulse", opacity: 0.8, size: 0.85 },
      { emoji: "✨", left: "42%", bottom: "62%", animation: "animate-bounce", opacity: 0.7, size: 0.75 },
      { emoji: "🔮", left: "72%", bottom: "45%", animation: "animate-pulse", opacity: 0.75, size: 0.9 },
      { emoji: "⭐", left: "88%", bottom: "58%", animation: "animate-bounce", opacity: 0.6, size: 0.7 },
      { emoji: "🌙", left: "6%", bottom: "65%", animation: "animate-pulse", opacity: 0.55, size: 0.8 },
    ],
    centralStructure: {
      baseName: "Citadel Runic Core",
      stages: [
        {
          stage: "early",
          stageNumber: 1,
          name: "Rune Altar Foundation",
          subtitle: "Ancient Stone Pedestal",
          icon: "🪨",
          description: "A cracked stone pedestal illuminated by soft purple runic glyphs.",
          minEnergy: 0,
          minLevel: 1,
        },
        {
          stage: "mid",
          stageNumber: 2,
          name: "Sanctum Archway of Insight",
          subtitle: "Twin-Pillared Starlight Gate",
          icon: "🗝️",
          description: "A towering twin-pillared stone archway channeling swirling arcane mists.",
          minEnergy: 40,
          minLevel: 3,
        },
        {
          stage: "advanced",
          stageNumber: 3,
          name: "Great Arcane Crystal Spire",
          subtitle: "Floating Monolithic Core",
          icon: "🔮",
          description: "A levitating amethyst crystal spire radiating harmonic energy across the ancient ruins.",
          minEnergy: 120,
          minLevel: 6,
        },
      ],
    },
    milestoneTitle: "Rune Decryption",
    progressionNote: "Complete missions to uncover forgotten glyphs and unlock mystic chambers.",
    elements: [
      {
        id: "puz-1",
        name: "Forgotten Plaza",
        icon: "🏛️",
        requiredEnergy: 0,
        requiredLevel: 1,
        description: "Ancient stone foundation stones surrounded by quiet purple mists.",
        narrativeUnlocked: "The central ruin plaza is cleared and mapped.",
        unlocked: true,
        color: "primary",
      },
      {
        id: "puz-2",
        name: "Runestone Pathway",
        icon: "🔮",
        requiredEnergy: 20,
        requiredLevel: 2,
        description: "Carved stone tiles that light up when stepped on in harmony.",
        narrativeUnlocked: "The illuminated rune path now guides your footsteps.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "puz-3",
        name: "Gate of Focus",
        icon: "🗝️",
        requiredEnergy: 50,
        requiredLevel: 3,
        description: "A massive engraved archway unlocked by sustained daily discipline.",
        narrativeUnlocked: "The Gate of Focus swings open, revealing inner courtyards.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "puz-4",
        name: "Chamber of Insight",
        icon: "💎",
        requiredEnergy: 90,
        requiredLevel: 4,
        description: "A subterranean archive lit by levitating luminescent crystals.",
        narrativeUnlocked: "Ancient knowledge crystals float and reflect your focus.",
        unlocked: false,
        color: "mint",
      },
      {
        id: "puz-5",
        name: "Amethyst Obelisk",
        icon: "🗿",
        requiredEnergy: 140,
        requiredLevel: 6,
        description: "A towering spire that channels mental clarity across the ruins.",
        narrativeUnlocked: "The obelisk pulses with steady, calm psychic harmony.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "puz-6",
        name: "Solar Crown Sanctum",
        icon: "✨",
        requiredEnergy: 200,
        requiredLevel: 8,
        description: "The supreme elevated throne where ancient energy converges.",
        narrativeUnlocked: "The ancient citadel is fully unlocked, radiating cosmic wisdom.",
        unlocked: false,
        color: "amber",
      },
    ],
  },

  // ── 3. Mind / Intellect (Quiz-Master) ──
  "quiz-master": {
    playStyle: "quiz-master",
    regionName: "The Citadel of Mind",
    worldTheme: "Grand Academy of Science & Discovery",
    tagline: "Your daily focus builds a towering monument of knowledge and scholarship.",
    skyGradient: "linear-gradient(180deg, #0f4c75 0%, #1b6ca8 30%, #2980b9 55%, #c7ecee 80%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #e0f7fa, #00cec9)",
    sunPosition: { top: "6%", right: "16%" },
    hillColors: ["#1a5276", "#0abde3", "#0086a8"],
    // Tiered cliff ledges and academic columnar silhouettes
    terrainPaths: {
      far: "M0 90 L50 65 L80 75 L120 45 L160 60 L200 40 L240 55 L280 30 L320 48 L360 25 L400 42 L440 20 L480 35 L480 140 L0 140 Z",
      mid: "M0 70 L40 50 L80 60 L110 35 L150 52 L185 30 L225 48 L265 22 L305 42 L345 18 L385 36 L425 14 L465 30 L480 26 L480 120 L0 120 Z",
      foreground: "M0 48 L30 30 L65 42 L100 18 L140 36 L175 14 L215 32 L255 12 L295 28 L335 10 L375 26 L415 8 L455 22 L480 18 L480 90 L0 90 Z",
    },
    ambientElements: [
      { emoji: "⭐", left: "15%", bottom: "62%", animation: "animate-pulse", opacity: 0.7, size: 0.8 },
      { emoji: "🔭", left: "38%", bottom: "52%", animation: "animate-bounce", opacity: 0.6, size: 0.75 },
      { emoji: "📡", left: "65%", bottom: "60%", animation: "animate-pulse", opacity: 0.65, size: 0.8 },
      { emoji: "🌟", left: "85%", bottom: "55%", animation: "animate-bounce", opacity: 0.6, size: 0.7 },
      { emoji: "🪐", left: "5%", bottom: "72%", animation: "animate-pulse", opacity: 0.5, size: 0.85 },
    ],
    centralStructure: {
      baseName: "Grand Academy Center",
      stages: [
        {
          stage: "early",
          stageNumber: 1,
          name: "Study Gazebo",
          subtitle: "Open-Air Scholar's Desk",
          icon: "📜",
          description: "An open-air stone gazebo with scrolls, compasses, and star charts.",
          minEnergy: 0,
          minLevel: 1,
        },
        {
          stage: "mid",
          stageNumber: 2,
          name: "Athenaeum of Discovery",
          subtitle: "Grand Colonnaded Library",
          icon: "🏛️",
          description: "A grand colonnaded library filled with glowing manuscripts and study desks.",
          minEnergy: 40,
          minLevel: 3,
        },
        {
          stage: "advanced",
          stageNumber: 3,
          name: "Celestial Observatory Dome",
          subtitle: "Great Astrolabe Spire",
          icon: "🔭",
          description: "A multi-tiered astronomical dome with polished brass astrolabes charting the stars.",
          minEnergy: 120,
          minLevel: 6,
        },
      ],
    },
    milestoneTitle: "Academic Expansion",
    progressionNote: "Complete missions to transcribe scrolls and expand the great campus.",
    elements: [
      {
        id: "quiz-1",
        name: "Academy Courtyard",
        icon: "🏛️",
        requiredEnergy: 0,
        requiredLevel: 1,
        description: "A peaceful marble courtyard dedicated to mindful thought.",
        narrativeUnlocked: "The Academy Courtyard is paved and open for contemplation.",
        unlocked: true,
        color: "primary",
      },
      {
        id: "quiz-2",
        name: "Study Pavilion",
        icon: "📜",
        requiredEnergy: 20,
        requiredLevel: 2,
        description: "Open-air wooden benches surrounded by whispering papyrus reeds.",
        narrativeUnlocked: "Study benches are set up for calm reading and reflection.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "quiz-3",
        name: "Reflection Library",
        icon: "📚",
        requiredEnergy: 50,
        requiredLevel: 3,
        description: "A vaulted hall containing records of your daily triumphs.",
        narrativeUnlocked: "The library shelves are organized with your personal growth records.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "quiz-4",
        name: "Scribe's Spire",
        icon: "🔭",
        requiredEnergy: 90,
        requiredLevel: 4,
        description: "A tall viewpoint where scholars document observations and insights.",
        narrativeUnlocked: "The Scribe's Spire overlooks the entire kingdom of thought.",
        unlocked: false,
        color: "mint",
      },
      {
        id: "quiz-5",
        name: "Stargazer Observatory",
        icon: "🌌",
        requiredEnergy: 140,
        requiredLevel: 6,
        description: "A brass telescope dome tracking your long-term life trajectory.",
        narrativeUnlocked: "The telescope is calibrated, revealing clear future possibilities.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "quiz-6",
        name: "Grand Celestial Archive",
        icon: "🧭",
        requiredEnergy: 200,
        requiredLevel: 8,
        description: "The ultimate vault of wisdom crowning the academy campus.",
        narrativeUnlocked: "The Grand Archive is completed, honoring lifelong dedication.",
        unlocked: false,
        color: "amber",
      },
    ],
  },

  // ── 4. Relaxed / Wellbeing (Casual-Player) ──
  "casual-player": {
    playStyle: "casual-player",
    regionName: "Haven Hollow",
    worldTheme: "Cozy Hearthside Settlement & Gardens",
    tagline: "Gentle daily consistency nurtures a warm, welcoming community village.",
    skyGradient: "linear-gradient(180deg, #ffeaa7 0%, #fab1a0 35%, #fdcb6e 65%, #fff4e6 85%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #fff2cc, #f39c12)",
    sunPosition: { top: "8%", right: "10%" },
    hillColors: ["#e8a838", "#e1b12c", "#d4940f"],
    // Soft, bumpy meadow-like terrain — warm and welcoming
    terrainPaths: {
      far: "M0 80 C60 55, 120 75, 180 58 C240 42, 300 68, 360 52 C400 42, 440 60, 480 50 L480 140 L0 140 Z",
      mid: "M0 65 C50 45, 100 62, 160 48 C220 34, 280 56, 340 42 C390 32, 435 50, 480 40 L480 120 L0 120 Z",
      foreground: "M0 44 C40 30, 85 44, 130 32 C175 20, 220 38, 270 26 C315 16, 360 32, 410 22 C440 16, 460 26, 480 22 L480 90 L0 90 Z",
    },
    ambientElements: [
      { emoji: "🌸", left: "10%", bottom: "38%", animation: "animate-bounce", opacity: 0.75, size: 0.9 },
      { emoji: "🌼", left: "30%", bottom: "30%", animation: "animate-pulse", opacity: 0.65, size: 0.8 },
      { emoji: "🦋", left: "55%", bottom: "48%", animation: "animate-bounce", opacity: 0.7, size: 0.85 },
      { emoji: "🌺", left: "78%", bottom: "36%", animation: "animate-pulse", opacity: 0.65, size: 0.8 },
      { emoji: "☁️", left: "20%", bottom: "72%", animation: "animate-bounce", opacity: 0.45, size: 1.1 },
      { emoji: "☁️", left: "65%", bottom: "78%", animation: "animate-pulse", opacity: 0.35, size: 0.9 },
    ],
    centralStructure: {
      baseName: "Hearthside Village Hub",
      stages: [
        {
          stage: "early",
          stageNumber: 1,
          name: "Meadow Hearth Cottage",
          subtitle: "Rustic Flowerpot Cottage",
          icon: "🏡",
          description: "A warm rustic cottage with flower boxes, vegetable plots, and a stone chimney.",
          minEnergy: 0,
          minLevel: 1,
        },
        {
          stage: "mid",
          stageNumber: 2,
          name: "Blossom Village Square",
          subtitle: "Community Fountain & Mill",
          icon: "🌻",
          description: "A bustling community square with a stone fountain, herbal tea tables, and cobblestone lanes.",
          minEnergy: 40,
          minLevel: 3,
        },
        {
          stage: "advanced",
          stageNumber: 3,
          name: "Everbloom Haven Estate",
          subtitle: "Sunlit Terraced Manor",
          icon: "🏰",
          description: "A breathtaking sunlit estate with terraced gardens, stream-side watermill, and flowering gazebos.",
          minEnergy: 120,
          minLevel: 6,
        },
      ],
    },
    milestoneTitle: "Village Bloom",
    progressionNote: "Every peaceful habit warms the hearth and welcomes new flora.",
    elements: [
      {
        id: "cas-1",
        name: "Wildflower Meadow",
        icon: "🌸",
        requiredEnergy: 0,
        requiredLevel: 1,
        description: "Soft pink and lavender blossoms swaying in a gentle breeze.",
        narrativeUnlocked: "The Wildflower Meadow is blossoming with cheerful colors.",
        unlocked: true,
        color: "mint",
      },
      {
        id: "cas-2",
        name: "Hearthside Cottage",
        icon: "🏡",
        requiredEnergy: 20,
        requiredLevel: 2,
        description: "A warm wooden cabin with a stone chimney and friendly front porch.",
        narrativeUnlocked: "The hearth fire is lit, welcoming restful evenings.",
        unlocked: false,
        color: "amber",
      },
      {
        id: "cas-3",
        name: "Herbal Blossom Garden",
        icon: "🌿",
        requiredEnergy: 50,
        requiredLevel: 3,
        description: "A fragrant garden patch growing mint, chamomile, and lavender.",
        narrativeUnlocked: "Fresh herbal scents soothe and refresh the whole valley.",
        unlocked: false,
        color: "mint",
      },
      {
        id: "cas-4",
        name: "Community Tea Pavilion",
        icon: "🍵",
        requiredEnergy: 90,
        requiredLevel: 4,
        description: "A shaded gazebo with wooden tables and warm ceramic mugs.",
        narrativeUnlocked: "The Tea Pavilion is open, offering peaceful breaks.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "cas-5",
        name: "Sunlit Orchard",
        icon: "🍎",
        requiredEnergy: 140,
        requiredLevel: 6,
        description: "Rows of sweet apple and cherry trees bathed in afternoon sunlight.",
        narrativeUnlocked: "The orchard branches are heavy with sweet, nourishing fruit.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "cas-6",
        name: "Everbloom Haven Sanctuary",
        icon: "🌈",
        requiredEnergy: 200,
        requiredLevel: 8,
        description: "The heart of Haven Hollow, where peaceful flowers bloom all year.",
        narrativeUnlocked: "The Everbloom Sanctuary radiates serene warmth and balance.",
        unlocked: false,
        color: "mint",
      },
    ],
  },

  // ── 5. Discipline / Mastery (Competitor) ──
  "competitor": {
    playStyle: "competitor",
    regionName: "Apex Citadel",
    worldTheme: "Valor Peak & Fortress of Discipline",
    tagline: "Every hard-won daily triumph reinforces an impregnable stronghold.",
    skyGradient: "linear-gradient(180deg, #1a0a00 0%, #7f1d1d 25%, #c0392b 50%, #e74c3c 70%, #4a0000 90%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #ffbe76, #e74c3c)",
    sunPosition: { top: "12%", right: "6%" },
    hillColors: ["#5c0a00", "#7f1d1d", "#991b1b"],
    // Sharp, jagged mountain peaks — fortress and strength silhouettes
    terrainPaths: {
      far: "M0 110 L35 70 L55 95 L80 50 L105 80 L130 38 L160 72 L190 28 L220 65 L250 20 L280 58 L310 15 L340 52 L375 18 L410 55 L445 22 L480 48 L480 140 L0 140 Z",
      mid: "M0 90 L30 58 L50 78 L75 38 L100 65 L125 28 L155 58 L180 18 L210 48 L240 12 L270 44 L300 8 L330 38 L365 10 L400 42 L435 16 L465 38 L480 28 L480 120 L0 120 Z",
      foreground: "M0 62 L28 40 L48 55 L70 28 L95 48 L120 18 L148 40 L175 12 L205 36 L235 8 L265 30 L298 6 L330 28 L362 8 L395 26 L428 10 L458 24 L480 14 L480 90 L0 90 Z",
    },
    ambientElements: [
      { emoji: "🔥", left: "8%", bottom: "35%", animation: "animate-pulse", opacity: 0.85, size: 0.9 },
      { emoji: "⚡", left: "28%", bottom: "55%", animation: "animate-bounce", opacity: 0.75, size: 0.8 },
      { emoji: "🔥", left: "55%", bottom: "40%", animation: "animate-pulse", opacity: 0.8, size: 0.85 },
      { emoji: "⚔️", left: "75%", bottom: "52%", animation: "animate-bounce", opacity: 0.7, size: 0.8 },
      { emoji: "🔥", left: "92%", bottom: "38%", animation: "animate-pulse", opacity: 0.75, size: 0.75 },
    ],
    centralStructure: {
      baseName: "Stronghold of Valor",
      stages: [
        {
          stage: "early",
          stageNumber: 1,
          name: "Valor Training Court",
          subtitle: "Sand & Stone Sparring Ring",
          icon: "⚔️",
          description: "A sand and stone sparring court ringed with discipline banners and iron weights.",
          minEnergy: 0,
          minLevel: 1,
        },
        {
          stage: "mid",
          stageNumber: 2,
          name: "Keep of the Vanguard",
          subtitle: "Stone Ramparts & Watchtower",
          icon: "🏰",
          description: "A fortified stone keep with high battlements and blazing iron braziers.",
          minEnergy: 40,
          minLevel: 3,
        },
        {
          stage: "advanced",
          stageNumber: 3,
          name: "High Citadel of Champions",
          subtitle: "Impregnable Peak Fortress",
          icon: "👑",
          description: "A grand impregnable fortress crowning the mountain peak with golden laurels and roaring eternal torches.",
          minEnergy: 120,
          minLevel: 6,
        },
      ],
    },
    milestoneTitle: "Fortress Reinforcement",
    progressionNote: "Complete challenging missions to raise iron banners and fortify the walls.",
    elements: [
      {
        id: "comp-1",
        name: "Training Courtyard",
        icon: "⚔️",
        requiredEnergy: 0,
        requiredLevel: 1,
        description: "A paved sand arena where discipline is forged with each repetition.",
        narrativeUnlocked: "The Training Courtyard is prepped for daily exercise routines.",
        unlocked: true,
        color: "primary",
      },
      {
        id: "comp-2",
        name: "Colosseum of Endurance",
        icon: "🏟️",
        requiredEnergy: 20,
        requiredLevel: 2,
        description: "A tiered stone amphitheater built to celebrate stamina milestones.",
        narrativeUnlocked: "The Colosseum stands strong, ready for longer daily streaks.",
        unlocked: false,
        color: "amber",
      },
      {
        id: "comp-3",
        name: "Bastion of Willpower",
        icon: "🏰",
        requiredEnergy: 50,
        requiredLevel: 3,
        description: "Reinforced granite walls defending against distraction and burnout.",
        narrativeUnlocked: "The Bastion walls rise high, shielding mental fortitude.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "comp-4",
        name: "Iron Beacon Tower",
        icon: "🗼",
        requiredEnergy: 90,
        requiredLevel: 4,
        description: "A flaming iron brazier signaling unshakeable stamina across the peak.",
        narrativeUnlocked: "The iron beacon burns bright, showcasing your resilience.",
        unlocked: false,
        color: "primary",
      },
      {
        id: "comp-5",
        name: "Summit of Mastery",
        icon: "⚡",
        requiredEnergy: 140,
        requiredLevel: 6,
        description: "A steep mountain crag demanding peak sleep consistency and movement.",
        narrativeUnlocked: "You have conquered the steep ridge to claim the high ground.",
        unlocked: false,
        color: "sky",
      },
      {
        id: "comp-6",
        name: "Champion's Crown Arena",
        icon: "👑",
        requiredEnergy: 200,
        requiredLevel: 8,
        description: "The golden amphitheater celebrating extraordinary daily dedication.",
        narrativeUnlocked: "The Champion's Crown Arena is fully built and roaring.",
        unlocked: false,
        color: "amber",
      },
    ],
  },
};

/**
 * Computes the active Central Structure stage based on Realm Energy and Level.
 */
export function getActiveCentralStructureStage(
  stages: CentralStructureStage[],
  realmEnergy: number = 0,
  level: number = 1,
): CentralStructureStage {
  if (!stages || stages.length === 0) {
    return {
      stage: "early",
      stageNumber: 1,
      name: "Basecamp",
      subtitle: "Starting Outpost",
      icon: "⛺",
      description: "A humble starter basecamp.",
      minEnergy: 0,
      minLevel: 1,
    };
  }

  // Reverse search to find the highest stage achieved
  for (let i = stages.length - 1; i >= 0; i--) {
    const s = stages[i];
    if (realmEnergy >= s.minEnergy || level >= s.minLevel) {
      return s;
    }
  }

  return stages[0];
}

/**
 * Returns the complete world configuration tailored to the player's active play style.
 */
export function getPlayStyleWorldConfig(
  playStyle: PlayStyle = "casual-player",
  realmEnergy: number = 0,
  level: number = 1,
): PlayStyleWorldConfig {
  const base = PLAY_STYLE_WORLDS[playStyle] || PLAY_STYLE_WORLDS["casual-player"];

  const currentStage = getActiveCentralStructureStage(
    base.centralStructure.stages,
    realmEnergy,
    level,
  );

  const elements: WorldElement[] = base.elements.map((el) => ({
    ...el,
    unlocked: el.requiredEnergy === 0 || realmEnergy >= el.requiredEnergy || level >= el.requiredLevel,
  }));

  return {
    ...base,
    centralStructure: {
      ...base.centralStructure,
      currentStage,
    },
    elements,
  };
}
