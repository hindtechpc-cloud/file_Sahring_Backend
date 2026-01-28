import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

async function main(contents) {
  const prompt = `
You are an expert summarizer.

Summarize the following content clearly and concisely.
- Focus only on what is written below
- Highlight the main ideas and important points
- Do not mention anything about files, documents, or sources
- Do not add external information

Content:
${contents}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}
export default main;
