import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting...");
console.log("API Key Present:", !!process.env.GEMINI_API_KEY);

async function test() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    console.log("Sending request...");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello in one sentence",
    });

    console.log("Response received:");
    console.log(response);
    console.log("Text:", response.text);
}

test()
    .then(() => console.log("Done"))
    .catch((err) => console.error("ERROR:", err));