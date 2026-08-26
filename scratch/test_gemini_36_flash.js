import fs from "fs";

// Load env
const env = fs.readFileSync(".env.local", "utf-8");
const keyMatch = env.match(/VITE_GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";

const MODEL_ID = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are EVOLV, a warm, friendly wellbeing companion for university students.
Your role is to gently get to know a student before helping them build their personal wellbeing journey.

STRICT RULES:
- You are NOT a therapist, doctor, or mental health professional.
- Never diagnose, label, or assess the student.
- Never provide medical or clinical advice.
- Never produce a visible "analysis", "report", or "assessment" in your responses.

CONVERSATION STYLE:
- Warm, empathetic, and conversational — like a thoughtful friend.
- Keep your responses short and digestible (2 to 4 sentences max).
- Ask only ONE clear, open question per response.

COMPLETION SIGNAL:
When you have had several meaningful exchanges (around 5-7 turns) and have a good sense of their challenges and goals, conclude your response with warm encouragement and add this exact token on a new line at the very end:
[EVOLV_CONVERSATION_COMPLETE]`;

async function callGeminiGenerateContent(requestBody, modelName = MODEL_ID) {
  console.log("Gemini model:", modelName);
  console.log("Gemini request body:", JSON.stringify(requestBody, null, 2));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelName
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textPart) throw new Error("No text in response");
  return textPart;
}

async function runFullTest() {
  console.log("=== STEP 1: Minimal 'Hello' Test ===");
  const minBody = {
    contents: [
      {
        parts: [{ text: "Hello" }],
      },
    ],
  };
  const minResp = await callGeminiGenerateContent(minBody);
  console.log("✓ Minimal test succeeded! Response snippet:", minResp.slice(0, 80));

  console.log("\n=== STEP 2: Opening Message Test ===");
  const openBody = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
  const openResp = await callGeminiGenerateContent(openBody);
  console.log("✓ Opening message succeeded! Response:", openResp);

  console.log("\n=== STEP 3: Multi-turn Conversation Message Test ===");
  const chatBody = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      { role: "user", parts: [{ text: "Hi, I am feeling a bit stressed with my assignments and sleep." }] },
      { role: "model", parts: [{ text: "Hey! I hear you, assignments and sleep troubles can really build up. What's been keeping you up the most?" }] },
      { role: "user", parts: [{ text: "I stay up late scrolling on my phone because I feel overwhelmed." }] }
    ],
  };
  const chatResp = await callGeminiGenerateContent(chatBody);
  console.log("✓ Conversation turn succeeded! Response:", chatResp);

  console.log("\n=== STEP 4: Structured Context Extraction Test ===");
  const transcriptText = `Student: Hi, I'm stressed with deadlines.
EVOLV: I hear you. What's keeping you up?
Student: I stay up until 2am on my phone, and barely get 5 hours of sleep. I don't exercise much either.
EVOLV: Got it. What do you want things to feel like?
Student: I just want to feel calm and have energy during the day.`;

  const extractBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Extract and return a JSON object matching this schema:
{
  "mentalStruggles": ["list of challenges"],
  "physicalDifficulties": ["list of physical challenges"],
  "lifestyleHabits": ["list of positive/neutral habits mentioned"],
  "academicPressure": "low|medium|high|unknown",
  "socialDifficulties": ["list of social challenges mentioned"],
  "desiredOutcome": "single sentence summary of what they want their life to feel like",
  "timeAvailability": "low|medium|high|unknown",
  "currentActivityLevel": "low|medium|high|unknown",
  "sleepPattern": "irregular|early|late|consistent|unknown",
  "screenTimePattern": "high|moderate|low|unknown"
}

TRANSCRIPT:
${transcriptText}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };
  const extractResp = await callGeminiGenerateContent(extractBody);
  console.log("✓ Context extraction succeeded! Parsed JSON:", JSON.parse(extractResp));

  console.log("\n============================================");
  console.log("🎉 ALL GEMINI 3.6 FLASH TESTS PASSED (200 OK)!");
  console.log("============================================");
}

runFullTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
