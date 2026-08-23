/**
 * playStyleWorldConfig.ts — Centralized play-style-specific world configurations.
 *
 * Implements:
 *  - Distinct visual themes, sky gradients, and hill colors per play style
 *  - Evolving Central World Structures (Early -> Mid -> Advanced stages)
 *  - Tailored unlockable world elements with required Realm Energy and Level
 *  - Progression narratives and milestones matching each player's play style
 */
import type { PlayStyle, PlayStyleWorldConfig, WorldElement, CentralStructureStage } from "../../types";

interface BasePlayStyleConfig {
  playStyle: PlayStyle;
  regionName: string;
  worldTheme: string;
  tagline: string;
  skyGradient: string;
  sunGlow: string;
  hillColors: [string, string, string];
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
    hillColors: ["#81c784", "#66bb6a", "#48bb78"],
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
    skyGradient: "linear-gradient(180deg, #dcd6f7 0%, #c4bbf0 35%, #e3e0f3 70%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #e0c3fc, #8e44ad)",
    hillColors: ["#a29bfe", "#7c6cf0", "#6c5ce7"],
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
    skyGradient: "linear-gradient(180deg, #c7ecee 0%, #7ed6df 35%, #dff9fb 75%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #e0f7fa, #00cec9)",
    hillColors: ["#48dbfb", "#0abde3", "#0086a8"],
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
    skyGradient: "linear-gradient(180deg, #ffeaa7 0%, #fab1a0 40%, #fdcb6e 70%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #fff2cc, #f39c12)",
    hillColors: ["#fbc531", "#e1b12c", "#c2911b"],
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
    skyGradient: "linear-gradient(180deg, #ff7675 0%, #d63031 35%, #2d3436 80%, var(--color-evolv-bg) 100%)",
    sunGlow: "radial-gradient(circle at 40% 40%, #ffbe76, #e74c3c)",
    hillColors: ["#eb4d4b", "#c0392b", "#7f1d1d"],
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
