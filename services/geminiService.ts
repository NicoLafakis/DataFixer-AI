
import { GoogleGenAI, Type } from "@google/genai";
import { CSVRow } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization using process.env.API_KEY directly as a named parameter.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async enrichAndCleanRow(
    domain: string,
    columnsToEnrich: string[],
    context: CSVRow,
    rules: { validateEmails: boolean; validatePhones: boolean }
  ): Promise<{ data: Partial<CSVRow>; sources: any[] }> {
    try {
      const prompt = `Task: Data Enrichment and Validation.
Target Domain: "${domain}"
Fields to find/fix: ${columnsToEnrich.join(", ")}
Current Data Context: ${JSON.stringify(context)}

Instructions:
1. Research the company associated with the domain using Google Search.
2. Fill in missing values for the requested fields.
3. If current data exists but looks incorrect (e.g., placeholder text), overwrite it with accurate information.
${rules.validateEmails ? "4. Ensure any email addresses follow standard format." : ""}
${rules.validatePhones ? "5. Standardize phone numbers to international format if possible." : ""}
6. Return a strictly valid JSON object. If info is unknown, use an empty string.`;

      // Using gemini-3-pro-preview for complex reasoning and data enrichment tasks.
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: columnsToEnrich.reduce((acc, col) => {
              acc[col] = { type: Type.STRING };
              return acc;
            }, {} as any),
          },
        },
      });

      // Directly access .text property from GenerateContentResponse.
      const text = response.text || "{}";
      const data = JSON.parse(text.trim());
      
      // Extract grounding metadata chunks to provide required attribution links.
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return { data, sources };
    } catch (error) {
      console.error("Enrichment error for domain:", domain, error);
      throw error;
    }
  }
}