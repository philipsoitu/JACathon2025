// src/app/api/ask-gemini/route.js
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    // READ JSON
    const { contents } = await request.json();
    if (!contents || !Array.isArray(contents)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing `contents` array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // CALL GEMINI
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,       // ← top‐level is now an array
          items: {                // ← each item must match this object
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Name of the destination or activity",
                nullable: false
              },
              price: {
                type: Type.NUMBER,
                description: "Estimated cost in USD",
                nullable: false
              },
              description: {
                type: Type.STRING,
                description: "Short description of the plan",
                nullable: false
              },
              lat: {
                type: Type.NUMBER,
                description: "Latitude coordinate",
                nullable: false
              },
              longi: {
                type: Type.NUMBER,
                description: "Longitude coordinate",
                nullable: false
              }
            },
            required: ["name", "price", "description", "lat", "longi"]
          }
        }
      }
    });

    //RETURN JSON //TEMPORARY WE SHALL PARSE AFTER
    console.log(response.text);
    return new Response(
      response.text,
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
