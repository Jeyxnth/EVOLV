import fs from "fs";

const env = fs.readFileSync(".env.local", "utf-8");
const keyMatch = env.match(/VITE_GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";

async function testExtraction() {
  const modelName = "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Extract structured JSON:
Student: I am feeling so overwhelmed with my coursework and my sleep is terrible because I stay up late.
EVOLV: I hear you.

Return JSON schema:
{
  "mentalStruggles": ["list of struggles"],
  "sleepPattern": "irregular|early|late|consistent|unknown"
}`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  console.log("Gemini model:", modelName);
  console.log("Gemini request body:", JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response text:", data.candidates?.[0]?.content?.parts?.[0]?.text);
}

testExtraction();
