/**
 * WorldPage.tsx — EVOLV Living World & Evolving Home Base Progression.
 *
 * Implements:
 *  - Removal of placeholder glowing blob
 *  - Evolving play-style specific Central World Core / Home Base (Early -> Mid -> Advanced)
 *  - Distinct visual landscape, terrain layers, and sky palettes for all 5 play styles
 *  - Unlockable landmarks integrated directly into the terrain contours
 *  - Next Discovery milestone card with exact energy requirements & progress bar
 *  - Interactive Virtual Companion (Lumi) inhabiting the living realm
 *  - Responsive presentation across mobile, tablet, and desktop screens
 */
import { useEffect, useState, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { BottomSheet } from "../components/ui/BottomSheet";
import { VirtualCompanion } from "../features/companion/VirtualCompanion";
import { CentralStructureModal } from "../features/world/CentralStructureModal";
import { calculateWorldProgression } from "../features/world/worldEngine";
import { getCompanionData } from "../features/companion/companionEngine";
import { getPlayStyleWorldConfig } from "../features/world/playStyleWorldConfig";
import { useAuth } from "../features/auth/AuthContext";
import { loadGamificationData, loadActivePlayStyle } from "../services/db";
import { createInitialGamificationData } from "../features/xp/gamificationEngine";
import type { GamificationData, RealmArea, WorldElement, PlayStyle } from "../types";

export function WorldPage() {
  const { session } = useAuth();
  const [gamification, setGamification] = useState<GamificationData>(createInitialGamificationData());
  const [playStyle, setPlayStyle] = useState<PlayStyle>("casual-player");
  const [selectedArea, setSelectedArea] = useState<RealmArea | null>(null);
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [centralBaseModalOpen, setCentralBaseModalOpen] = useState(false);

  const uid = session?.uid ?? "demo";
  const isDemo = session?.isDemo ?? true;

  const loadData = useCallback(async () => {
    try {
      const [gData, ps] = await Promise.all([
        loadGamificationData(uid, isDemo),
        loadActivePlayStyle(uid, isDemo),
      ]);
      setGamification(gData);
      setPlayStyle(ps);
    } catch (err) {
      console.error("[WorldPage] Error loading world gamification data:", err);
    }
  }, [uid, isDemo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize gamification and play-style events across tabs/pages
  useEffect(() => {
    const gamificationHandler = (e: Event) => {
      const customEvent = e as CustomEvent<GamificationData>;
      if (customEvent.detail) {
        setGamification(customEvent.detail);
      }
    };
    const playStyleHandler = (e: Event) => {
      const customEvent = e as CustomEvent<PlayStyle>;
      if (customEvent.detail) {
        setPlayStyle(customEvent.detail);
      }
    };

    window.addEventListener("evolv:gamification-updated", gamificationHandler);
    window.addEventListener("evolv:playstyle-changed", playStyleHandler);
    return () => {
      window.removeEventListener("evolv:gamification-updated", gamificationHandler);
      window.removeEventListener("evolv:playstyle-changed", playStyleHandler);
    };
  }, []);

  const world = calculateWorldProgression(
    gamification.currentLevel,
    gamification.totalXp,
    gamification.realmEnergy,
    playStyle,
  );
  const worldConfig = getPlayStyleWorldConfig(playStyle, gamification.realmEnergy, gamification.currentLevel);
  const companion = getCompanionData(gamification.currentLevel, gamification.totalXp);
  const { currentStage } = worldConfig.centralStructure;

  const unlockedElementsCount = world.elements.filter((e) => e.unlocked).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Play-Style Specific Living World Canvas ── */}
      <div
        className="relative w-full overflow-hidden h-80 sm:h-96 md:h-[420px] lg:h-[460px] transition-all duration-1000 select-none shadow-sm"
        aria-label={`Your ${worldConfig.worldTheme} world realm`}
      >
        {/* Play-style tailored Atmospheric Sky */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: worldConfig.skyGradient,
          }}
        />

        {/* Distant Mountain Range — Layer 3 with play-style palette */}
        <svg
          className="absolute bottom-0 w-full transition-all duration-1000"
          viewBox="0 0 480 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 75 L60 45 L130 68 L200 35 L280 62 L360 38 L430 65 L480 50 L480 140 L0 140 Z"
            fill={worldConfig.hillColors[0]}
            opacity="0.45"
          />
        </svg>

        {/* Mid Rolling Hills & Trails — Layer 2 */}
        <svg
          className="absolute bottom-0 w-full transition-all duration-1000"
          viewBox="0 0 480 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 60 C90 35, 170 65, 240 45 C320 25, 410 55, 480 40 L480 120 L0 120 Z"
            fill={worldConfig.hillColors[1]}
            opacity="0.65"
          />
        </svg>

        {/* Foreground Ground & Terrace — Layer 1 */}
        <svg
          className="absolute bottom-0 w-full transition-all duration-1000"
          viewBox="0 0 480 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 38 C80 22, 180 42, 270 30 C350 20, 420 38, 480 32 L480 90 L0 90 Z"
            fill={worldConfig.hillColors[2]}
            opacity="0.88"
          />
        </svg>

        {/* Natural Terrain Trails linking to Home Base */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 480 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M50 240 Q150 220 240 190 Q330 220 430 240"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>

        {/* ── Central Evolving World Core / Home Base ── */}
        <div
          onClick={() => setCentralBaseModalOpen(true)}
          className="absolute top-20 sm:top-24 md:top-28 left-1/2 -translate-x-1/2 z-20 cursor-pointer group press-scale transition-all duration-500"
          role="button"
          tabIndex={0}
          aria-label={`Central Home Base: ${currentStage.name} (Stage ${currentStage.stageNumber} of 3)`}
        >
          <div className="flex flex-col items-center">
            {/* Core Icon & Aura Badge */}
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] border-2 border-white/80 transition-transform duration-500 group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, var(--color-evolv-surface) 100%)",
                }}
              >
                {currentStage.icon}
              </div>

              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-evolv-mint)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-evolv-mint)]"></span>
              </span>
            </div>

            {/* Core Stage Badge */}
            <div className="mt-1.5 flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                {currentStage.name}
              </span>
              <span className="text-[9px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.2 rounded-full mt-0.5">
                Stage {currentStage.stageNumber}/3 • Tap to View
              </span>
            </div>
          </div>
        </div>

        {/* ── Visual Landmarks Distributed across the Landscape ── */}
        <div className="absolute inset-0 pointer-events-auto z-15">
          {world.elements.map((el, i) => {
            const positions = [
              { bottom: "18px", left: "6%" },
              { bottom: "46px", left: "22%" },
              { bottom: "70px", left: "36%" },
              { bottom: "68px", right: "22%" },
              { bottom: "42px", right: "8%" },
              { bottom: "16px", right: "2%" },
            ];
            const pos = positions[i % positions.length];

            return (
              <button
                key={el.id}
                onClick={() => setSelectedElement(el)}
                aria-label={`${el.name} - ${el.unlocked ? "Restored Landmark" : `Requires ${el.requiredEnergy} Realm Energy`}`}
                className={[
                  "absolute flex flex-col items-center transition-all duration-700 select-none cursor-pointer press-scale focus:outline-none",
                  el.unlocked
                    ? "opacity-100 scale-100 hover:scale-110"
                    : "opacity-45 scale-90 hover:opacity-75 filter grayscale contrast-75",
                ].join(" ")}
                style={pos}
              >
                <div
                  className={[
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-md transition-all",
                    el.unlocked
                      ? "bg-white/90 border border-white/80 shadow-lg animate-fade-in-up"
                      : "bg-black/30 border border-white/20 backdrop-blur-xs",
                  ].join(" ")}
                >
                  {el.icon}
                </div>
                <span
                  className={[
                    "text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 whitespace-nowrap shadow-xs",
                    el.unlocked
                      ? "text-white bg-black/60 backdrop-blur-xs"
                      : "text-white/80 bg-black/40 backdrop-blur-xs",
                  ].join(" ")}
                >
                  {el.unlocked ? el.name : `🔒 ${el.requiredEnergy}⚡`}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Virtual Companion (Lumi) Floating in the Living World ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-25">
          <VirtualCompanion
            level={gamification.currentLevel}
            totalXp={gamification.totalXp}
            size="md"
            playStyle={playStyle}
            completedMissionsToday={gamification.completedMissionIds?.length ?? 0}
            currentStreak={gamification.currentStreak}
          />
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="flex-1 px-[var(--space-evolv-page)] md:px-6 lg:px-8 pb-28 md:pb-12 pt-4 space-y-6">
        {/* World Header Status */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="primary" size="xs">
                {worldConfig.worldTheme}
              </Badge>
              <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                • {companion.stageTitle}
              </span>
            </div>
            <h1 className="font-display font-bold text-[var(--text-evolv-2xl)] text-[var(--color-evolv-ink)] leading-tight">
              {worldConfig.regionName}
            </h1>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-0.5">
              {worldConfig.tagline}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="mint" size="sm">
              {unlockedElementsCount}/{world.elements.length} Landmarks
            </Badge>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-primary)] font-bold mt-1">
              ⚡ {gamification.realmEnergy} Realm Energy
            </p>
          </div>
        </div>

        {/* Next Unlock Milestone Banner */}
        {world.nextElement ? (
          <Card
            variant="elevated"
            className="p-5 animate-fade-in-up stagger-1 border-l-4 border-l-[var(--color-evolv-mint)] bg-gradient-to-r from-[var(--color-evolv-surface)] to-[var(--color-evolv-surface-raised)]"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl p-2.5 rounded-2xl bg-[var(--color-evolv-mint-soft)] shrink-0">
                {world.nextElement.icon}
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="mint" size="xs">Next Discovery</Badge>
                  <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                    Requires {world.nextElement.requiredEnergy} Realm Energy (Level {world.nextElement.requiredLevel})
                  </span>
                </div>
                <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] leading-tight">
                  {world.nextElement.name}
                </h2>
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
                  {world.nextElement.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[var(--color-evolv-border-soft)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--text-evolv-xs)]">
                <span className="font-medium text-[var(--color-evolv-muted)]">
                  Progress: <strong className="text-[var(--color-evolv-ink)]">{gamification.realmEnergy}/{world.nextElement.requiredEnergy} Energy</strong>
                </span>
                <span className="font-bold text-[var(--color-evolv-primary)]">
                  {world.energyToNextElement} Energy needed
                </span>
              </div>
              <ProgressBar
                value={world.progressToNextElementPct}
                color="mint"
                height="xs"
              />
            </div>
          </Card>
        ) : (
          <Card
            variant="elevated"
            className="p-5 animate-fade-in-up border-l-4 border-l-[var(--color-evolv-mint)] bg-[var(--color-evolv-mint-soft)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌟</span>
              <div>
                <p className="font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                  Realm Completely Flourishing!
                </p>
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
                  All major landmarks have materialized in your world. Continue daily habits to accumulate surplus Realm Energy.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Play-Style Unlockable Elements Grid */}
        <section aria-labelledby="world-elements-heading" className="animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="world-elements-heading"
              className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]"
            >
              World Elements & Landmarks
            </h2>
            <span className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
              {worldConfig.milestoneTitle}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {world.elements.map((el, i) => (
              <Card
                key={el.id}
                interactive
                variant={el.unlocked ? "default" : "outlined"}
                onClick={() => setSelectedElement(el)}
                className={[
                  "flex flex-col items-center text-center gap-2 p-3.5 transition-all cursor-pointer press-scale",
                  `animate-fade-in-up stagger-${i + 1}`,
                  el.unlocked
                    ? "hover:shadow-md border-[var(--color-evolv-border)] bg-[var(--color-evolv-surface)]"
                    : "opacity-55 bg-[var(--color-evolv-surface-raised)] border-dashed",
                ].join(" ")}
              >
                <span className="text-3xl p-2 rounded-xl bg-[var(--color-evolv-surface-raised)]">
                  {el.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-evolv-xs)] text-[var(--color-evolv-ink)] leading-tight truncate">
                    {el.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-evolv-muted)] mt-0.5">
                    {el.unlocked ? "✓ Restored" : `${el.requiredEnergy}⚡ Energy`}
                  </p>
                </div>
                <Badge variant={el.unlocked ? el.color : "neutral"} size="xs">
                  {el.unlocked ? "Unlocked" : `Level ${el.requiredLevel}`}
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* Realm Sanctuaries Section */}
        <section aria-labelledby="realm-areas-heading" className="animate-fade-in-up stagger-3">
          <h2
            id="realm-areas-heading"
            className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] mb-3"
          >
            Major Realm Sanctuaries
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {world.areas.map((area, i) => (
              <Card
                key={area.id}
                interactive
                variant={area.unlocked ? "default" : "outlined"}
                onClick={() => setSelectedArea(area)}
                className={[
                  "flex flex-col items-center text-center gap-2.5 py-4 px-3.5 transition-all cursor-pointer press-scale",
                  `animate-fade-in-up stagger-${i + 1}`,
                  area.unlocked
                    ? "hover:shadow-md border-[var(--color-evolv-border)]"
                    : "opacity-60 bg-[var(--color-evolv-surface-raised)] border-dashed",
                ].join(" ")}
              >
                <span className="text-3xl p-2 rounded-xl bg-[var(--color-evolv-surface-raised)]">
                  {area.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] leading-tight truncate">
                    {area.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-evolv-muted)] mt-0.5">
                    {area.unlocked ? "Tap for Lore" : `Unlocks at Level ${area.unlockLevel}`}
                  </p>
                </div>
                <Badge variant={area.unlocked ? area.color : "neutral"} size="xs">
                  {area.unlocked ? "Active Sanctuary" : `🔒 Level ${area.unlockLevel}`}
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* Vitality & Reward Loop summary card */}
        <Card
          variant="soft"
          className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-start gap-4 p-5"
        >
          <span className="text-3xl shrink-0 p-2 rounded-2xl bg-[var(--color-evolv-primary-soft)]">
            ✨
          </span>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
              Vitality & Progression Loop
            </p>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
              Every real-life mission awards <strong>+XP</strong> and <strong>+Realm Energy</strong>. Reaching energy milestones materializes new landmarks in your world and expands your home base structure.
            </p>
          </div>
        </Card>
      </div>

      {/* Central Home Base Evolution Modal */}
      <CentralStructureModal
        isOpen={centralBaseModalOpen}
        worldConfig={worldConfig}
        currentEnergy={gamification.realmEnergy}
        currentLevel={gamification.currentLevel}
        onClose={() => setCentralBaseModalOpen(false)}
      />

      {/* Element Detail Modal */}
      {selectedElement && (
        <BottomSheet
          open={selectedElement !== null}
          onClose={() => setSelectedElement(null)}
          title={selectedElement.name}
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]">
              <span className="text-4xl p-2 rounded-xl bg-[var(--color-evolv-surface)] shrink-0">
                {selectedElement.icon}
              </span>
              <div>
                <p className="font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                  {selectedElement.name}
                </p>
                <Badge variant={selectedElement.unlocked ? selectedElement.color : "neutral"} size="xs" className="mt-1">
                  {selectedElement.unlocked ? "Restored to Realm" : `Requires ${selectedElement.requiredEnergy}⚡ Realm Energy`}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[var(--text-evolv-xs)] font-bold uppercase tracking-wider text-[var(--color-evolv-muted)]">
                Landmark Discovery
              </p>
              <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] leading-relaxed bg-[var(--color-evolv-surface)] p-3.5 rounded-xl border border-[var(--color-evolv-border-soft)]">
                "{selectedElement.description}"
              </p>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-mint-dark)] font-medium italic">
                🌿 {selectedElement.narrativeUnlocked}
              </p>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Area Lore & Detail Modal */}
      {selectedArea && (
        <BottomSheet
          open={selectedArea !== null}
          onClose={() => setSelectedArea(null)}
          title={selectedArea.name}
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]">
              <span className="text-4xl p-2 rounded-xl bg-[var(--color-evolv-surface)] shrink-0">
                {selectedArea.icon}
              </span>
              <div>
                <p className="font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                  {selectedArea.title}
                </p>
                <Badge variant={selectedArea.unlocked ? selectedArea.color : "neutral"} size="xs" className="mt-1">
                  {selectedArea.unlocked ? "Unlocked Sanctuary" : `Requires Level ${selectedArea.unlockLevel}`}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[var(--text-evolv-xs)] font-bold uppercase tracking-wider text-[var(--color-evolv-muted)]">
                Atmosphere & Lore
              </p>
              <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-ink)] leading-relaxed bg-[var(--color-evolv-surface)] p-3.5 rounded-xl border border-[var(--color-evolv-border-soft)]">
                "{selectedArea.lore}"
              </p>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] italic">
                🌿 {selectedArea.atmosphere}
              </p>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
