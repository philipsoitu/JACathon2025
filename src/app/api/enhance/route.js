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
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name:        { type: Type.STRING,  nullable: false },
            price:       { type: Type.NUMBER,  nullable: false },
            description: { type: Type.STRING,  nullable: false },
            lat:         { type: Type.NUMBER,  nullable: false },
            longi:       { type: Type.NUMBER,  nullable: false },
          },
          required: ["name","price","description","lat","longi"]
        }
      }
    }
  });

    //RETURN JSON //TEMPORARY WE SHALL PARSE AFTER

    //me when i absolutley lie, we parse now
    let plans;
    try{
        plans = JSON.parse(response.text);
    } catch(e) {
        //errored out the request
        return new Response(
            JSON.stringify({ error: "Gemini returned invalid JSON" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );}
    //now iterate and parse
    for(const plan of plans){
        const{name,price,description,lat,longi} = plan;
        //here will go actual database bs
        console.log("Plan:", name, price, description, lat, longi,'\n');
    }

    //this will get deleted we dont really need this no more
    //console.log(response.text);
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
