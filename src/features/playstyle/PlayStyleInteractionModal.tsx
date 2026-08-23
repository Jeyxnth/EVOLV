/**
 * PlayStyleInteractionModal.tsx - Lightweight post-completion interaction.
 *
 * Renders an engaging, non-blocking modal tailored to the student's play style:
 *  - Quiz Master: 1-question habit reflection with friendly explanation
 *  - Puzzle Explorer: Unlocks a visual clue fragment for the weekly mystery
 *  - Casual Player: Serene mindful affirmation
 *  - Competitor: Personal milestone summary
 *  - Explorer / Builder: World vitality contribution
 */
import { useState } from "react";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { PlayStyle } from "../../types";
import type {
  AdaptedMission,
  QuizInteraction,
  PuzzleInteraction,
  CasualInteraction,
  CompetitorInteraction,
  BuilderInteraction,
} from "./playStyleAdapter";

interface PlayStyleInteractionModalProps {
  mission: AdaptedMission;
  playStyle: PlayStyle;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayStyleInteractionModal({
  mission,
  playStyle: _playStyle,
  isOpen,
  onClose,
}: PlayStyleInteractionModalProps) {
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const interaction = mission.interaction;
  if (!interaction) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={mission.framingTag}>
      <div className="space-y-4 pt-1">
        {/* Mission header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-evolv-border-soft)]">
          <span className="text-2xl">{mission.icon ?? "⚡"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] truncate">
              {mission.presentationTitle}
            </p>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-mint-dark)] font-medium">
              {mission.completionFeedback}
            </p>
          </div>
          <Badge variant="mint" size="xs">+{mission.xpReward} XP</Badge>
        </div>

        {/* ── 1. QUIZ MASTER ── */}
        {interaction.type === "quiz" && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-sky-soft)] border border-[var(--color-evolv-sky-muted)]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">💡</span>
                <span className="text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-sky)] uppercase tracking-wider">
                  Knowledge Moment
                </span>
              </div>
              <p className="text-[var(--text-evolv-sm)] font-semibold text-[var(--color-evolv-ink)] leading-snug">
                {(interaction as QuizInteraction).question}
              </p>
            </div>

            <div className="space-y-2">
              {(interaction as QuizInteraction).options.map((opt, idx) => {
                const isSelected = selectedQuizIdx === idx;
                const isCorrect = idx === (interaction as QuizInteraction).correctIndex;
                let btnStyle = "bg-[var(--color-evolv-surface)] border-[var(--color-evolv-border-soft)] text-[var(--color-evolv-ink)]";

                if (quizSubmitted) {
                  if (isCorrect) {
                    btnStyle = "bg-[var(--color-evolv-mint-soft)] border-[var(--color-evolv-mint)] text-[var(--color-evolv-mint-dark)] font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-[var(--color-evolv-amber-soft)] border-[var(--color-evolv-amber)] text-[var(--color-evolv-amber-dark)]";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-[var(--color-evolv-sky-soft)] border-[var(--color-evolv-sky)] text-[var(--color-evolv-sky)] font-medium";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => setSelectedQuizIdx(idx)}
                    className={`w-full p-3 rounded-[var(--radius-evolv-card)] text-left text-[var(--text-evolv-xs)] border transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {quizSubmitted && isCorrect && <span className="text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div className="p-3 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)] animate-fade-in-up">
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-ink)] leading-relaxed">
                  {(interaction as QuizInteraction).explanation}
                </p>
              </div>
            )}

            <div className="pt-2">
              {!quizSubmitted ? (
                <Button
                  variant="primary"
                  fullWidth
                  disabled={selectedQuizIdx === null}
                  onClick={() => setQuizSubmitted(true)}
                >
                  Check Answer
                </Button>
              ) : (
                <Button variant="soft" fullWidth onClick={onClose}>
                  Got it
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── 2. PUZZLE EXPLORER ── */}
        {interaction.type === "puzzle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-primary-soft)] border border-[var(--color-evolv-primary-muted)] text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] mx-auto flex items-center justify-center text-3xl animate-bounce-in">
                {(interaction as PuzzleInteraction).fragmentIcon}
              </div>
              <p className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                {(interaction as PuzzleInteraction).clueTitle}
              </p>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
                {(interaction as PuzzleInteraction).clueText}
              </p>
            </div>
            <Button variant="primary" fullWidth onClick={onClose}>
              Keep Exploring
            </Button>
          </div>
        )}

        {/* ── 3. CASUAL PLAYER ── */}
        {interaction.type === "casual" && (
          <div className="space-y-4">
            <div className="p-5 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-mint-soft)] border border-[var(--color-evolv-mint-muted)] text-center space-y-2.5">
              <span className="text-3xl">🌿</span>
              <p className="font-display font-semibold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] leading-snug">
                {(interaction as CasualInteraction).affirmation}
              </p>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-mint-dark)] italic">
                {(interaction as CasualInteraction).reflectionPrompt}
              </p>
            </div>
            <Button variant="primary" fullWidth onClick={onClose}>
              Continue Gently
            </Button>
          </div>
        )}

        {/* ── 4. COMPETITOR ── */}
        {interaction.type === "competitor" && (
          <div className="space-y-4">
            <div className="p-4 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-amber-soft)] border border-[var(--color-evolv-amber-muted)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-evolv-xs)] font-bold text-[var(--color-evolv-amber-dark)] uppercase">
                  {(interaction as CompetitorInteraction).metricLabel}
                </span>
                <span className="text-xl">⚡</span>
              </div>
              <p className="text-[var(--text-evolv-sm)] font-medium text-[var(--color-evolv-ink)] leading-relaxed">
                {(interaction as CompetitorInteraction).personalRecordNote}
              </p>
              <div className="pt-2 border-t border-[var(--color-evolv-amber-muted)]">
                <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium">
                  Next Milestone: <span className="text-[var(--color-evolv-ink)] font-semibold">{(interaction as CompetitorInteraction).nextMilestone}</span>
                </p>
              </div>
            </div>
            <Button variant="primary" fullWidth onClick={onClose}>
              Keep The Momentum
            </Button>
          </div>
        )}

        {/* ── 5. EXPLORER / BUILDER ── */}
        {interaction.type === "builder" && (
          <div className="space-y-4">
            <div className="p-4 rounded-[var(--radius-evolv-card)] bg-[var(--color-evolv-peach-soft)] border border-[var(--color-evolv-peach-muted)] space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] mx-auto flex items-center justify-center text-2xl">
                🏛️
              </div>
              <p className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]">
                {(interaction as BuilderInteraction).worldArea}
              </p>
              <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] leading-relaxed">
                {(interaction as BuilderInteraction).contributionNote}
              </p>
              <div className="pt-1">
                <Badge variant="mint" size="xs">
                  +{(interaction as BuilderInteraction).energyPoints} Realm Energy
                </Badge>
              </div>
            </div>
            <Button variant="primary" fullWidth onClick={onClose}>
              Back to Realm
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
