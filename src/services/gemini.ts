/**
 * gemini.ts — Gemini AI service for EVOLV.
 *
 * Provides:
 *  1. Multi-turn natural conversation via direct REST API for Gemini 3.6 Flash.
 *  2. Structured PlayerAIContext extraction (JSON mode).
 *  3. Fallback conversation when API is unavailable.
 *
 * Uses:
 *  - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent
 *  - REST API format conforming to Gemini GenerateContent specifications.
 */
import type { PlayerAIContext } from "../types";

/* ── Configuration ────────────────────────────────────────────────── */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const hasGeminiConfig = Boolean(GEMINI_API_KEY);

const MODEL_ID = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";

if (!hasGeminiConfig) {
  console.warn(
    "[gemini] VITE_GEMINI_API_KEY is not set — fallback conversation mode will be used.",
  );
} else {
  console.info(`[gemini] Configured with model ${MODEL_ID}.`);
}

/* ── Message types ────────────────────────────────────────────────── */

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

/* ── System prompt ────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are EVOLV, a warm, friendly wellbeing companion for university students.
Your role is to gently get to know a student before helping them build their personal wellbeing journey.

STRICT RULES:
- You are NOT a therapist, doctor, or mental health professional.
- Never diagnose, label, or assess the student.
- Never provide medical or clinical advice.
- Never produce a visible "analysis", "report", or "assessment" in your responses.
- If the student expresses serious distress, respond with warmth, gently suggest speaking with a trusted friend, family member, or university counselling service, and continue the conversation supportively.

CONVERSATION STYLE:
- Warm, empathetic, and conversational — like a thoughtful friend.
- Keep your responses short and digestible (2 to 4 sentences max).
- Ask only ONE clear, open question per response.
- Always acknowledge and validate what the student just shared before asking the next question.
- Do NOT jump between topics mechanically or act like a survey form.
- Use casual, supportive language.

CONVERSATION AREAS TO EXPLORE NATURALLY:
1. What has been feeling challenging lately (life, studies, daily rhythm)
2. Sleep habits and energy levels
3. Physical movement / activity
4. Academic or workload pressure
5. Screen and phone habits
6. What they would love their daily life to feel like after making progress
7. Available time to dedicate to small habits

COMPLETION SIGNAL:
When you have had several meaningful exchanges (around 5-7 turns) and have a good sense of their challenges and goals, conclude your response with warm encouragement and add this exact token on a new line at the very end:
[EVOLV_CONVERSATION_COMPLETE]

Do NOT mention or explain this completion token to the student.`;

/* ── REST API Types & Client ──────────────────────────────────────── */

export interface GenerateContentRequestBody {
  contents: Array<{
    role?: "user" | "model";
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    responseMimeType?: string;
  };
}

/**
 * Validates request payload against Gemini API constraints before sending.
 */
function validateGeminiRequest(
  apiKey: string | undefined,
  modelName: string,
  contents: Array<{ role?: "user" | "model"; parts: Array<{ text: string }> }>,
) {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("Gemini API key is missing or invalid.");
  }

  if (modelName !== "gemini-3.6-flash") {
    console.warn(`[gemini] Note: configured modelName is '${modelName}'. Expected 'gemini-3.6-flash'.`);
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    throw new Error("Gemini request contents array cannot be empty.");
  }

  for (let i = 0; i < contents.length; i++) {
    const turn = contents[i];
    if (!turn || !Array.isArray(turn.parts) || turn.parts.length === 0) {
      throw new Error(`Gemini turn at index ${i} has empty or missing parts.`);
    }

    for (let j = 0; j < turn.parts.length; j++) {
      const part = turn.parts[j];
      if (!part || typeof part.text !== "string" || !part.text.trim()) {
        throw new Error(`Gemini part at index [${i}][${j}] has invalid/empty text.`);
      }
    }

    if (turn.role && turn.role !== "user" && turn.role !== "model") {
      throw new Error(`Invalid role '${turn.role}' at index ${i}. Allowed: 'user' | 'model'.`);
    }
  }

  const lastTurn = contents[contents.length - 1];
  if (lastTurn.role === "model") {
    throw new Error("Invalid request: final turn cannot be a prefilled model/assistant response.");
  }
}

const GEMINI_TIMEOUT_MS = 45000;

/**
 * Dispatches a REST generateContent request to Gemini 3.6 Flash.
 */
export async function callGeminiGenerateContent(
  requestBody: GenerateContentRequestBody,
  modelName: string = MODEL_ID,
): Promise<string> {
  validateGeminiRequest(GEMINI_API_KEY, modelName, requestBody.contents);

  console.log("Gemini model:", modelName);
  console.log("Gemini request body:", JSON.stringify(requestBody, null, 2));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelName,
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY!)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!res.ok) {
      let errorDetails = "";
      try {
        const errorJson = await res.json();
        errorDetails = JSON.stringify(errorJson);
      } catch {
        errorDetails = await res.text();
      }
      throw new Error(
        `Gemini API request failed with status ${res.status} (${res.statusText}): ${errorDetails}`,
      );
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (typeof textPart !== "string" || !textPart.trim()) {
      throw new Error("No valid text response returned by Gemini API.");
    }

    return textPart;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      const timeoutErr = new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS / 1000}s`);
      console.error("[gemini] Request timeout:", timeoutErr.message);
      throw timeoutErr;
    }
    console.error("[gemini] Request failed:", err instanceof Error ? err.message : String(err));
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ── Conversation Manager ─────────────────────────────────────────── */

/**
 * Gets the opening message from EVOLV to start the conversation.
 */
export async function getOpeningMessage(): Promise<string> {
  console.log("[gemini] Requesting opening conversation message...");

  const requestBody: GenerateContentRequestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Start the wellbeing conversation as EVOLV. Greet the student warmly in 2-3 sentences and ask an open question about what has been feeling challenging or on their mind lately.",
          },
        ],
      },
    ],
  };

  const rawText = await callGeminiGenerateContent(requestBody);
  const cleaned = rawText.replace("[EVOLV_CONVERSATION_COMPLETE]", "").trim();

  if (!cleaned) {
    throw new Error("Empty opening message received from Gemini");
  }

  console.log("[gemini] Received opening message:", cleaned);
  return cleaned;
}

/**
 * Sends a user message with full conversation history and returns the assistant's reply.
 *
 * @returns { reply, isComplete }
 */
export async function sendConversationMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<{ reply: string; isComplete: boolean }> {
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("User message cannot be empty.");
  }

  console.log("[gemini] Sending message with history length:", history.length);

  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const msg of history) {
    if (!msg || !msg.text || !msg.text.trim()) continue;
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text.trim() }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: userMessage.trim() }],
  });

  const requestBody: GenerateContentRequestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
  };

  const rawText = await callGeminiGenerateContent(requestBody);

  // Count user turns in conversation (including this one)
  const userTurns = contents.filter((m) => m.role === "user").length;

  // Completion criteria: signal present after at least 4 turns, or automatically after 7 turns
  const hasSignal = rawText.includes("[EVOLV_CONVERSATION_COMPLETE]");
  const isComplete = (hasSignal && userTurns >= 4) || userTurns >= 7;

  // Clean reply text
  const reply = rawText
    .replace("[EVOLV_CONVERSATION_COMPLETE]", "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  console.log(`[gemini] Turn ${userTurns} reply received (isComplete: ${isComplete}):`, reply);

  return { reply, isComplete };
}

/* ── Structured extraction ────────────────────────────────────────── */

/**
 * Given the full conversation transcript, extracts structured PlayerAIContext as JSON.
 * Silent, non-displayed call.
 */
export async function extractPlayerContext(
  transcript: ChatMessage[],
): Promise<PlayerAIContext> {
  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "Student" : "EVOLV"}: ${m.text}`)
    .join("\n");

  const extractionPrompt = `
You are a data extraction system. Analyze this student wellbeing conversation and extract structured context.

CONVERSATION TRANSCRIPT:
${transcriptText}

Extract and return a JSON object matching this schema:
{
  "mentalStruggles": ["list of identified mental or emotional challenges, e.g. stress, burnout, anxiety, overwhelm"],
  "physicalDifficulties": ["list of physical challenges, e.g. lack of exercise, fatigue, low energy"],
  "lifestyleHabits": ["list of positive/neutral habits mentioned"],
  "academicPressure": "low|medium|high|unknown",
  "socialDifficulties": ["list of social challenges mentioned"],
  "desiredOutcome": "single sentence summary of what they want their life to feel like",
  "timeAvailability": "low|medium|high|unknown",
  "currentActivityLevel": "low|medium|high|unknown",
  "sleepPattern": "irregular|early|late|consistent|unknown",
  "screenTimePattern": "high|moderate|low|unknown"
}
`;

  try {
    console.log("[gemini] Extracting structured PlayerAIContext...");

    const requestBody: GenerateContentRequestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: extractionPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const raw = await callGeminiGenerateContent(requestBody);
    const jsonText = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonText);
    const validated = validateAndNormalizeContext(parsed, "gemini");
    console.log("[gemini] Successfully extracted context:", validated);
    return validated;
  } catch (err) {
    console.warn("[gemini] Context extraction failed, falling back to heuristic parsing:", err);
    return buildFallbackContext([]);
  }
}

/* ── Validation & normalization ───────────────────────────────────── */

type PressureLevel = "low" | "medium" | "high" | "unknown";
type SleepPattern = "irregular" | "early" | "late" | "consistent" | "unknown";
type ScreenPattern = "high" | "moderate" | "low" | "unknown";

function validateEnum<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function validateStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string").slice(0, 10);
}

export function validateAndNormalizeContext(
  raw: Record<string, unknown>,
  source: "gemini" | "fallback",
): PlayerAIContext {
  const PRESSURE: PressureLevel[] = ["low", "medium", "high", "unknown"];
  const SLEEP: SleepPattern[] = ["irregular", "early", "late", "consistent", "unknown"];
  const SCREEN: ScreenPattern[] = ["high", "moderate", "low", "unknown"];

  return {
    mentalStruggles: validateStringArray(raw.mentalStruggles),
    physicalDifficulties: validateStringArray(raw.physicalDifficulties),
    lifestyleHabits: validateStringArray(raw.lifestyleHabits),
    academicPressure: validateEnum<PressureLevel>(raw.academicPressure, PRESSURE, "unknown"),
    socialDifficulties: validateStringArray(raw.socialDifficulties),
    desiredOutcome: typeof raw.desiredOutcome === "string" ? raw.desiredOutcome.slice(0, 300) : "",
    timeAvailability: validateEnum<PressureLevel>(raw.timeAvailability, PRESSURE, "unknown"),
    currentActivityLevel: validateEnum<PressureLevel>(raw.currentActivityLevel, PRESSURE, "unknown"),
    sleepPattern: validateEnum<SleepPattern>(raw.sleepPattern, SLEEP, "unknown"),
    screenTimePattern: validateEnum<ScreenPattern>(raw.screenTimePattern, SCREEN, "unknown"),
    source,
    collectedAt: new Date().toISOString(),
  };
}

/* ── Fallback conversation ────────────────────────────────────────── */

export interface FallbackQuestion {
  key: string;
  text: string;
}

export const FALLBACK_QUESTIONS: FallbackQuestion[] = [
  {
    key: "challenges",
    text: "Hey! Before we set up your journey, I'd love to get to know you a little. What's been feeling a bit challenging lately — in life, uni, or just day-to-day? No pressure to share everything!",
  },
  {
    key: "sleep",
    text: "Thanks for sharing! How's your sleep been? Do you feel like you're getting enough rest, or has it been a bit off?",
  },
  {
    key: "activity",
    text: "And physically — would you say you're pretty active day-to-day, or is movement something you'd like to build more of?",
  },
  {
    key: "academic",
    text: "What about uni workload — is it feeling manageable right now, or is it weighing on you a bit?",
  },
  {
    key: "screentime",
    text: "One more — how do you feel about your screen/phone habits? Something you'd like to change, or all good?",
  },
  {
    key: "desired",
    text: "Last question! Imagine a few months from now, things feel a little better. What would that look like for you? What would feel different?",
  },
];

export function buildFallbackContext(
  answers: Array<{ key: string; answer: string }>,
): PlayerAIContext {
  const get = (key: string) =>
    answers.find((a) => a.key === key)?.answer.toLowerCase() ?? "";

  const challenges = get("challenges");
  const sleep = get("sleep");
  const activity = get("activity");
  const academic = get("academic");
  const screentime = get("screentime");
  const desired = get("desired");

  const mentalKeywords = ["stress", "anxious", "anxiety", "overwhelm", "worried", "sad", "tired", "low", "burn", "motivation", "focus"];
  const mentalStruggles = mentalKeywords.filter((k) =>
    challenges.includes(k) || academic.includes(k),
  );

  const physicalKeywords = ["energy", "active", "exercise", "gym", "walk", "sit", "sedentary", "tired"];
  const physicalDifficulties = activity.includes("not") || activity.includes("less") || activity.includes("more")
    ? ["low activity"]
    : physicalKeywords.filter((k) => activity.includes(k));

  let academicPressure: "low" | "medium" | "high" | "unknown" = "unknown";
  if (academic.includes("fine") || academic.includes("manage") || academic.includes("ok"))
    academicPressure = "low";
  else if (academic.includes("lot") || academic.includes("hard") || academic.includes("tough"))
    academicPressure = "high";
  else if (academic.length > 10) academicPressure = "medium";

  let sleepPattern: PlayerAIContext["sleepPattern"] = "unknown";
  if (sleep.includes("late") || sleep.includes("night")) sleepPattern = "late";
  else if (sleep.includes("early") || sleep.includes("good") || sleep.includes("fine")) sleepPattern = "consistent";
  else if (sleep.includes("irregular") || sleep.includes("off") || sleep.includes("bad") || sleep.includes("poor")) sleepPattern = "irregular";

  let screenTimePattern: PlayerAIContext["screenTimePattern"] = "unknown";
  if (screentime.includes("lot") || screentime.includes("too much") || screentime.includes("high")) screenTimePattern = "high";
  else if (screentime.includes("fine") || screentime.includes("ok") || screentime.includes("good")) screenTimePattern = "low";
  else if (screentime.length > 5) screenTimePattern = "moderate";

  let currentActivityLevel: "low" | "medium" | "high" | "unknown" = "unknown";
  if (activity.includes("not") || activity.includes("less") || activity.includes("sedentary")) currentActivityLevel = "low";
  else if (activity.includes("quite") || activity.includes("fairly") || activity.includes("gym")) currentActivityLevel = "medium";
  else if (activity.includes("very") || activity.includes("lot") || activity.includes("run")) currentActivityLevel = "high";
  else if (activity.length > 10) currentActivityLevel = "medium";

  return {
    mentalStruggles: mentalStruggles.slice(0, 5),
    physicalDifficulties: physicalDifficulties.slice(0, 3),
    lifestyleHabits: [],
    academicPressure,
    socialDifficulties: [],
    desiredOutcome: desired ? desired.slice(0, 200) : "",
    timeAvailability: "unknown",
    currentActivityLevel,
    sleepPattern,
    screenTimePattern,
    source: "fallback",
    collectedAt: new Date().toISOString(),
  };
}
