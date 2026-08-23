/**
 * AIConversationStep — onboarding AI conversation screen.
 *
 * Phase 5: Gemini-powered natural conversation to understand the student.
 *
 * DESIGN RULES (enforced here):
 *  - The player NEVER sees a "profile analysis" or "diagnosis".
 *  - Structured PlayerAIContext is extracted silently after conversation ends.
 *  - If Gemini is unavailable, the fallback scripted questions are used.
 *  - Completion silently extracts context, then advances to Goal Setting.
 *
 * The player experience: "EVOLV is getting to know me."
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../../components/ui/Button";
import { CompanionPlaceholder } from "../../../components/profile/CompanionPlaceholder";
import { useOnboarding } from "../OnboardingContext";
import {
  hasGeminiConfig,
  getOpeningMessage,
  sendConversationMessage,
  extractPlayerContext,
  buildFallbackContext,
  FALLBACK_QUESTIONS,
  type ChatMessage,
  type FallbackQuestion,
} from "../../../services/gemini";

/* ── Constants ────────────────────────────────────────────────────── */

/** Typing indicator shows for at least this long (ms) for realism */
const MIN_TYPING_MS = 800;
/** Max ms the typing indicator shows before we give up waiting */
const MAX_TYPING_MS = 12000;

/* ── Component ────────────────────────────────────────────────────── */

export function AIConversationStep() {
  const { nextStep, setAIContext } = useOnboarding();

  // Shared state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isConversationDone, setIsConversationDone] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [initError, setInitError] = useState(false);

  // Fallback mode state
  const [useFallback, setUseFallback] = useState(!hasGeminiConfig);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [fallbackAnswers, setFallbackAnswers] = useState<Array<{ key: string; answer: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<ChatMessage[]>([]);

  // Auto-scroll to latest message
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  /* ── Initialize: get opening message ────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsTyping(true);

      if (useFallback) {
        // Fallback: use the first scripted question after a short delay
        await delay(MIN_TYPING_MS);
        if (cancelled) return;
        const opening = FALLBACK_QUESTIONS[0].text;
        const msg: ChatMessage = { role: "assistant", text: opening };
        setMessages([msg]);
        setIsTyping(false);
        return;
      }

      // Real Gemini mode
      try {
        console.log("[AIConversationStep] Fetching initial Gemini greeting...");
        const typingStart = Date.now();
        const opening = await raceWithTimeout(getOpeningMessage(), MAX_TYPING_MS);
        const elapsed = Date.now() - typingStart;
        if (elapsed < MIN_TYPING_MS) await delay(MIN_TYPING_MS - elapsed);
        if (cancelled) return;
        const msg: ChatMessage = { role: "assistant", text: opening };
        historyRef.current = [msg];
        setMessages([msg]);
        console.log("[AIConversationStep] Gemini active and ready.");
      } catch (err) {
        console.error("[AIConversationStep] Gemini opening failed, switching to fallback:", err);
        if (cancelled) return;
        setUseFallback(true);
        setInitError(true);
        const opening = FALLBACK_QUESTIONS[0].text;
        const msg: ChatMessage = { role: "assistant", text: opening };
        setMessages([msg]);
      } finally {
        if (!cancelled) setIsTyping(false);
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Send a message ──────────────────────────────────────────────── */

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping || isConversationDone || isExtracting) return;

    setInputText("");
    const userMsg: ChatMessage = { role: "user", text };

    if (useFallback) {
      await handleFallbackTurn(userMsg);
    } else {
      await handleGeminiTurn(userMsg);
    }
  }, [inputText, isTyping, isConversationDone, isExtracting, useFallback]); // eslint-disable-line

  async function handleGeminiTurn(userMsg: ChatMessage) {
    const newHistory = [...historyRef.current, userMsg];
    historyRef.current = newHistory;
    setMessages(newHistory);
    setIsTyping(true);

    try {
      console.log("[AIConversationStep] Sending user message to Gemini...");
      const typingStart = Date.now();
      const { reply, isComplete } = await raceWithTimeout(
        sendConversationMessage(historyRef.current.slice(0, -1), userMsg.text),
        MAX_TYPING_MS,
      );
      const elapsed = Date.now() - typingStart;
      if (elapsed < MIN_TYPING_MS) await delay(MIN_TYPING_MS - elapsed);

      const assistantMsg: ChatMessage = { role: "assistant", text: reply };
      historyRef.current = [...newHistory, assistantMsg];
      setMessages(historyRef.current);
      setIsTyping(false);

      if (isComplete) {
        await finishConversation(historyRef.current, false);
      }
    } catch (err) {
      console.error("[AIConversationStep] Gemini turn failed, switching to fallback mode:", err);
      setUseFallback(true);
      setIsTyping(false);
      // Show the current fallback question
      const currentQ = FALLBACK_QUESTIONS[Math.min(fallbackIndex, FALLBACK_QUESTIONS.length - 1)];
      const fallbackMsg: ChatMessage = { role: "assistant", text: currentQ.text };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  }

  async function handleFallbackTurn(userMsg: ChatMessage) {
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const currentQ = FALLBACK_QUESTIONS[fallbackIndex];
    const newAnswers = [...fallbackAnswers, { key: currentQ.key, answer: userMsg.text }];
    setFallbackAnswers(newAnswers);

    const nextFallbackIndex = fallbackIndex + 1;
    await delay(MIN_TYPING_MS);

    if (nextFallbackIndex >= FALLBACK_QUESTIONS.length) {
      // All fallback questions answered
      setIsTyping(false);
      await finishConversation([], true, newAnswers);
    } else {
      const nextQ: FallbackQuestion = FALLBACK_QUESTIONS[nextFallbackIndex];
      setFallbackIndex(nextFallbackIndex);
      const nextMsg: ChatMessage = { role: "assistant", text: nextQ.text };
      setMessages((prev) => [...prev, nextMsg]);
      setIsTyping(false);
    }
  }

  /* ── Finish: extract context and advance ─────────────────────────── */

  async function finishConversation(
    transcript: ChatMessage[],
    isFallback: boolean,
    answers?: Array<{ key: string; answer: string }>,
  ) {
    setIsConversationDone(true);

    // Show a warm closing message
    const closingMsg: ChatMessage = {
      role: "assistant",
      text: "Thanks for sharing that with me. 😊 I've got a much better sense of what your journey can look like. Let's start building it.",
    };
    setMessages((prev) => [...prev, closingMsg]);

    // Brief pause before extracting
    await delay(1500);
    setIsExtracting(true);

    try {
      let context;
      if (isFallback) {
        context = buildFallbackContext(answers ?? []);
      } else {
        context = await extractPlayerContext(transcript);
      }
      setAIContext(context);
    } catch {
      // Extraction failure — build empty fallback so we never block
      setAIContext(buildFallbackContext([]));
    }

    setIsExtracting(false);
    nextStep();
  }

  /* ── Skip conversation (safety valve for judging/demo) ───────────── */

  async function handleSkip() {
    const dummyContext = buildFallbackContext([]);
    setAIContext(dummyContext);
    nextStep();
  }

  /* ── Render ──────────────────────────────────────────────────────── */

  const canSend = inputText.trim().length > 0 && !isTyping && !isConversationDone && !isExtracting;

  return (
    <div className="flex flex-col h-full">
      {/* Header with companion */}
      <div
        className="shrink-0 px-5 pt-2 pb-3 flex items-center gap-3 border-b border-[var(--color-evolv-border-soft)]"
        style={{ background: "var(--color-evolv-surface)" }}
      >
        <CompanionPlaceholder size="sm" />
        <div>
          <p className="font-display font-bold text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)] leading-tight">
            EVOLV
          </p>
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
            {isExtracting ? "Setting things up…" : "Getting to know you"}
          </p>
        </div>
        {/* Skip button — subtle, for demos */}
        {!isConversationDone && (
          <button
            onClick={handleSkip}
            className="ml-auto text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted-light)] hover:text-[var(--color-evolv-muted)] transition-colors"
          >
            Skip
          </button>
        )}
        {/* Fallback indicator — subtle, not alarming */}
        {initError && (
          <span className="ml-auto text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted-light)]">
            ✦ guided mode
          </span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Extraction spinner */}
        {isExtracting && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-[var(--color-evolv-primary-soft)] border-t-[var(--color-evolv-primary)] animate-spin" />
              Building your profile…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="shrink-0 px-4 pb-8 pt-3 border-t border-[var(--color-evolv-border-soft)]"
        style={{ background: "var(--color-evolv-surface)" }}
      >
        {isConversationDone ? (
          <div className="text-center text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] animate-fade-in">
            {isExtracting ? "One moment…" : "✨ All set!"}
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              id="ai-conversation-input"
              type="text"
              placeholder="Type your reply…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isTyping || isConversationDone || isExtracting}
              maxLength={500}
              className={[
                "flex-1 px-4 py-3 rounded-[var(--radius-evolv-xl)]",
                "bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]",
                "text-[var(--text-evolv-base)] text-[var(--color-evolv-ink)]",
                "placeholder:text-[var(--color-evolv-muted-light)]",
                "focus:outline-none focus:border-[var(--color-evolv-primary)] focus:ring-2 focus:ring-[var(--color-evolv-primary-soft)]",
                "transition-all resize-none",
                (isTyping || isConversationDone) ? "opacity-50" : "",
              ].join(" ")}
            />
            <Button
              id="ai-conversation-send"
              variant="primary"
              size="md"
              disabled={!canSend}
              onClick={handleSend}
              className="shrink-0 !px-4 !py-3 rounded-[var(--radius-evolv-xl)]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 9h14M10 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={["flex animate-fade-in-up", isAssistant ? "justify-start" : "justify-end"].join(" ")}>
      <div
        className={[
          "max-w-[82%] px-4 py-3 rounded-[var(--radius-evolv-xl)] text-[var(--text-evolv-base)] leading-relaxed",
          isAssistant
            ? "rounded-tl-[var(--radius-evolv-sm)] bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border-soft)] shadow-[var(--shadow-evolv-sm)] text-[var(--color-evolv-ink)]"
            : "rounded-tr-[var(--radius-evolv-sm)] bg-[var(--color-evolv-primary)] text-white shadow-[var(--shadow-evolv-glow)]",
        ].join(" ")}
      >
        {message.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="px-4 py-3 rounded-[var(--radius-evolv-xl)] rounded-tl-[var(--radius-evolv-sm)] bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border-soft)] shadow-[var(--shadow-evolv-sm)]">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--color-evolv-primary-muted)] animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Utilities ────────────────────────────────────────────────────── */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function raceWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}
