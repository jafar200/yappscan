import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (itemName: string): Promise<string> => {
  try {
    const prompt = `اكتب وصفًا قصيرًا وجذابًا باللغة العربية لعنصر في قائمة طعام اسمه "${itemName}". يجب أن يكون الوصف مناسبًا للتسويق ويجعل الزبون يرغب في تجربة الطبق.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "حدث خطأ أثناء إنشاء الوصف. يرجى المحاولة مرة أخرى.";
  }
};
