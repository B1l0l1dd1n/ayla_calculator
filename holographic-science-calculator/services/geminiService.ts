import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = ai.models['gemini-2.5-flash'];

function fileToGenerativePart(base64: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export const solveProblem = async (prompt: string, imageBase64?: string, imageMimeType?: string): Promise<string> => {
  try {
    const contents: Part[] = [{ text: prompt }];

    if (imageBase64 && imageMimeType) {
      const imagePart = fileToGenerativePart(imageBase64, imageMimeType);
      contents.unshift(imagePart); // Image first, then prompt
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: "You are A.Y.L.A., a powerful scientific assistant. Solve the user's problem, providing a clear, step-by-step explanation in Russian. Format your answers for readability in a web interface (e.g., use markdown).",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Ошибка при обращении к Gemini API: ${error.message}`;
    }
    return "Произошла неизвестная ошибка при обращении к Gemini API.";
  }
};