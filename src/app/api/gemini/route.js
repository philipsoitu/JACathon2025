// src/app/api/ask-gemini/route.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    // 1️⃣ Read the full body
    const body = await request.json();
    console.log("☁️ Received body:", body);

    // 2️⃣ Pull out the array you sent
    const { contents } = body;
    if (!contents || !Array.isArray(contents)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing `contents` array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3️⃣ Send it straight to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,          // <-- now the real array, not a string
    });

    // 4️⃣ Return the AI text
    return new Response(
      JSON.stringify({ response: response.text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
