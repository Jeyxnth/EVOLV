/**
 * AddMissionSheet.tsx — Lightweight modal for adding suggested or custom daily missions.
 *
 * Allows students to:
 *  1. Quick-add from curated wellbeing activities (walking, water, journaling, etc.)
 *  2. Create a custom mission with automatic play-style framing and fair XP allocation.
 */
import { useState } from "react";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Mission, MissionCategory, PlayStyle } from "../../types";

export interface SuggestedActivity {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  icon: string;
  xpReward: number;
  playStyleFraming: Record<PlayStyle, string>;
}

export const SUGGESTED_ACTIVITIES: SuggestedActivity[] = [
  {
    id: "sug-walk",
    title: "15-Minute Refresh Walk",
    description: "Step outside or walk around campus to clear your mind and move your body.",
    category: "physical",
    icon: "🚶",
    xpReward: 20,
    playStyleFraming: {
      "puzzle-explorer": "Scout the trail: 15 minutes of outdoor discovery.",
      "quiz-master": "Observation quest: note 3 interesting details along your route.",
      "casual-player": "A pleasant, unhurried walk to breathe and reset.",
      "competitor": "Pace yourself: clock 15 active walking minutes.",
      "explorer-builder": "Chart the surrounding landscape with fresh movement.",
    },
  },
  {
    id: "sug-water",
    title: "Hydration Boost (2 Glasses)",
    description: "Drink two refreshing glasses of water to revitalize your body and focus.",
    category: "lifestyle",
    icon: "💧",
    xpReward: 10,
    playStyleFraming: {
      "puzzle-explorer": "Replenish vital hydration reserves.",
      "quiz-master": "Cellular health check: fuel brain function with fresh water.",
      "casual-player": "Sip two cool glasses of water at your own pace.",
      "competitor": "Fast recovery: hydrate for sustained cognitive stamina.",
      "explorer-builder": "Nourish your avatar's core energy with clean hydration.",
    },
  },
  {
    id: "sug-stretch",
    title: "5-Minute Body Stretch",
    description: "Gently stretch your neck, shoulders, and lower back to release tension.",
    category: "physical",
    icon: "🧘",
    xpReward: 10,
    playStyleFraming: {
      "puzzle-explorer": "Unwind muscle knots to restore flexible alignment.",
      "quiz-master": "Mobility check: release upper-body tension in 5 minutes.",
      "casual-player": "A cozy, gentle stretch to soften your posture.",
      "competitor": "Flexibility routine: prime your body for afternoon endurance.",
      "explorer-builder": "Reinforce physical stamina with mobility care.",
    },
  },
  {
    id: "sug-run",
    title: "Light Jog or Cardio Run",
    description: "Get your heart pumping with 15 minutes of running or cardio movement.",
    category: "physical",
    icon: "🏃",
    xpReward: 30,
    playStyleFraming: {
      "puzzle-explorer": "Fast-travel run: explore the path at an elevated tempo.",
      "quiz-master": "Cardio challenge: maintain steady pacing for 15 minutes.",
      "casual-player": "A gentle jog to shake off stress and lift your mood.",
      "competitor": "High-intensity cardio: elevate heart rate and build endurance.",
      "explorer-builder": "Channel athletic energy to power up your world.",
    },
  },
  {
    id: "sug-workout",
    title: "15-Minute Quick Workout",
    description: "Complete a simple bodyweight or resistance routine.",
    category: "physical",
    icon: "💪",
    xpReward: 20,
    playStyleFraming: {
      "puzzle-explorer": "Physical conditioning trial: build strength through movement.",
      "quiz-master": "Form & discipline check: complete 15 minutes of exercises.",
      "casual-player": "A comfortable bodyweight session to feel strong and grounded.",
      "competitor": "Strength milestone: push through your daily workout routine.",
      "explorer-builder": "Fortify your physical base with strength training.",
    },
  },
  {
    id: "sug-journal",
    title: "Mindful Journaling Reflection",
    description: "Write down 3 highlights, thoughts, or feelings from today.",
    category: "mental-reflective",
    icon: "📓",
    xpReward: 20,
    playStyleFraming: {
      "puzzle-explorer": "Decode your thoughts: record the story of your day.",
      "quiz-master": "Self-discovery inquiry: document 3 genuine takeaways.",
      "casual-player": "A quiet moment with your thoughts to write whatever comes.",
      "competitor": "Mental debrief: reflect on today's progress and focus.",
      "explorer-builder": "Archive your daily memories in your personal realm.",
    },
  },
  {
    id: "sug-breathe",
    title: "5-Minute Quiet Breathing",
    description: "Close your eyes, slow your breath, and let mental chatter settle.",
    category: "mental-reflective",
    icon: "🌬️",
    xpReward: 10,
    playStyleFraming: {
      "puzzle-explorer": "Enter the quiet chamber: 5 minutes of stillness.",
      "quiz-master": "Breathwork focus: count slow, rhythmic inhalations and exhalations.",
      "casual-player": "Rest your eyes and enjoy a calm, quiet pause.",
      "competitor": "Composure reset: down-regulate stress for sharp focus.",
      "explorer-builder": "Cultivate a sanctuary of peace in your mind.",
    },
  },
  {
    id: "sug-sleep",
    title: "Bedtime Wind-Down Ritual",
    description: "Begin relaxing 30 minutes before sleep with dim lights and quiet time.",
    category: "lifestyle",
    icon: "🌙",
    xpReward: 20,
    playStyleFraming: {
      "puzzle-explorer": "Initiate night recovery mode: prepare for restorative rest.",
      "quiz-master": "Circadian routine: align your evening habit for quality sleep.",
      "casual-player": "Dim the lamps and cozy up for a peaceful night's rest.",
      "competitor": "Recovery protocol: wind down early for maximum energy tomorrow.",
      "explorer-builder": "Power down the daily world and recharge your avatar.",
    },
  },
  {
    id: "sug-screen",
    title: "30-Minute Screen-Free Break",
    description: "Step away from all screens to rest your eyes and reset your attention.",
    category: "digital",
    icon: "📱",
    xpReward: 20,
    playStyleFraming: {
      "puzzle-explorer": "Disconnect the digital link: 30 minutes of real-world presence.",
      "quiz-master": "Focus test: spend 30 distraction-free minutes away from screens.",
      "casual-player": "Put the phone face-down and enjoy the world around you.",
      "competitor": "Digital detox sprint: eliminate notifications for 30 minutes.",
      "explorer-builder": "Protect your mental sanctuary from digital noise.",
    },
  },
];

interface AddMissionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMission: (mission: Mission) => void;
  existingMissionCount: number;
  maxDailyMissions?: number;
  todayDate: string;
}

export function AddMissionSheet({
  isOpen,
  onClose,
  onAddMission,
  existingMissionCount,
  maxDailyMissions = 8,
  todayDate,
}: AddMissionSheetProps) {
  const [activeTab, setActiveTab] = useState<"suggested" | "custom">("suggested");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customCategory, setCustomCategory] = useState<MissionCategory>("physical");
  const [customIntensity, setCustomIntensity] = useState<"quick" | "regular" | "deep">("regular");

  const isAtLimit = existingMissionCount >= maxDailyMissions;

  const handleAddSuggested = (sug: SuggestedActivity) => {
    if (isAtLimit) return;

    const newMission: Mission = {
      id: `user_mission_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: sug.title,
      description: sug.description,
      icon: sug.icon,
      category: sug.category,
      xpReward: sug.xpReward,
      playStyleFraming: sug.playStyleFraming,
      completionMode: "manual",
      completed: false,
      date: todayDate,
    };

    onAddMission(newMission);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || isAtLimit) return;

    const xpReward = customIntensity === "quick" ? 10 : customIntensity === "deep" ? 30 : 20;

    let icon = "⚡";
    if (customCategory === "physical") icon = "🏃";
    else if (customCategory === "mental-reflective") icon = "🧘";
    else if (customCategory === "digital") icon = "📱";
    else if (customCategory === "lifestyle") icon = "🌱";

    const title = customTitle.trim();
    const desc = customDescription.trim() || "User-added wellbeing mission.";

    const newMission: Mission = {
      id: `custom_mission_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      description: desc,
      icon,
      category: customCategory,
      xpReward,
      playStyleFraming: {
        "puzzle-explorer": `Custom quest: ${title}`,
        "quiz-master": `Personal challenge: ${title}`,
        "casual-player": `Mindful step: ${title}`,
        "competitor": `Target objective: ${title}`,
        "explorer-builder": `Expansion habit: ${title}`,
      },
      completionMode: "manual",
      completed: false,
      date: todayDate,
    };

    onAddMission(newMission);
    setCustomTitle("");
    setCustomDescription("");
    onClose();
  };

  return (
    <BottomSheet open={isOpen} onClose={onClose} title="Add Today's Mission">
      <div className="space-y-4 pt-1">
        {/* Limit Warning (Gentle and friendly) */}
        {isAtLimit ? (
          <div className="p-4 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-amber-soft)] border border-[var(--color-evolv-amber)] text-center space-y-1">
            <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
              Daily Mission Limit ({maxDailyMissions})
            </p>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
              You already have {existingMissionCount} missions scheduled today. Focus on these small steps to avoid burnout 🌱
            </p>
          </div>
        ) : (
          <>
            {/* Tab switch */}
            <div className="flex rounded-xl p-1 bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]">
              <button
                type="button"
                onClick={() => setActiveTab("suggested")}
                className={[
                  "flex-1 py-2 text-center text-[var(--text-evolv-xs)] font-bold rounded-lg transition-all",
                  activeTab === "suggested"
                    ? "bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] text-[var(--color-evolv-primary)]"
                    : "text-[var(--color-evolv-muted)] hover:text-[var(--color-evolv-ink)]",
                ].join(" ")}
              >
                💡 Suggested Activities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={[
                  "flex-1 py-2 text-center text-[var(--text-evolv-xs)] font-bold rounded-lg transition-all",
                  activeTab === "custom"
                    ? "bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] text-[var(--color-evolv-primary)]"
                    : "text-[var(--color-evolv-muted)] hover:text-[var(--color-evolv-ink)]",
                ].join(" ")}
              >
                ✏️ Custom Mission
              </button>
            </div>

            {/* Tab 1: Suggested Habits */}
            {activeTab === "suggested" && (
              <div className="space-y-2">
                {SUGGESTED_ACTIVITIES.map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => handleAddSuggested(sug)}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-surface)] hover:bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)] transition-all cursor-pointer press-scale"
                  >
                    <span className="text-2xl w-9 h-9 rounded-full bg-[var(--color-evolv-primary-soft)] flex items-center justify-center shrink-0">
                      {sug.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] leading-tight">
                        {sug.title}
                      </p>
                      <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] truncate mt-0.5">
                        {sug.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Badge variant="mint" size="xs">+{sug.xpReward} XP</Badge>
                      <span className="text-lg font-bold text-[var(--color-evolv-primary)]">+</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Custom Mission Creator */}
            {activeTab === "custom" && (
              <form onSubmit={handleAddCustom} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-ink)] mb-1.5">
                    Mission Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="e.g., Read 15 pages of a book"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)] text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] focus:outline-none focus:border-[var(--color-evolv-primary)] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-ink)] mb-1.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g., Quiet afternoon reading time"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border)] text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] focus:outline-none focus:border-[var(--color-evolv-primary)] transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-ink)] mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "physical", label: "🏃 Physical Activity" },
                      { id: "mental-reflective", label: "🧘 Mental & Reflective" },
                      { id: "digital", label: "📱 Digital Wellness" },
                      { id: "lifestyle", label: "🌱 Healthy Lifestyle" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCustomCategory(cat.id as MissionCategory)}
                        className={[
                          "p-2.5 rounded-lg text-left text-[var(--text-evolv-xs)] font-medium border transition-all",
                          customCategory === cat.id
                            ? "bg-[var(--color-evolv-primary-soft)] border-[var(--color-evolv-primary)] text-[var(--color-evolv-primary)] font-bold"
                            : "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)]",
                        ].join(" ")}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity / XP Allocation */}
                <div>
                  <label className="block text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-ink)] mb-1.5">
                    Habit Scale & Reward
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "quick", label: "Quick / Small", xp: 10 },
                      { id: "regular", label: "Regular Habit", xp: 20 },
                      { id: "deep", label: "Deep / Longer", xp: 30 },
                    ].map((scale) => (
                      <button
                        key={scale.id}
                        type="button"
                        onClick={() => setCustomIntensity(scale.id as "quick" | "regular" | "deep")}
                        className={[
                          "p-2.5 rounded-lg text-center text-[var(--text-evolv-xs)] border transition-all",
                          customIntensity === scale.id
                            ? "bg-[var(--color-evolv-mint-soft)] border-[var(--color-evolv-mint)] text-[var(--color-evolv-mint-dark)] font-bold"
                            : "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)]",
                        ].join(" ")}
                      >
                        <div>{scale.label}</div>
                        <div className="font-bold text-[11px] mt-0.5">+{scale.xp} XP</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  disabled={!customTitle.trim()}
                >
                  Add Custom Mission ✨
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
