import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentType, ToneType } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey });

const JEREZ_CONTEXT = `
You are an expert AI assistant for the city of Jerez de la Frontera, Spain.
Key knowledge areas:
- Fiestas: Feria del Caballo (May), Semana Santa, Fiestas de la Vendimia (September), Zambombas (Christmas).
- Culture: Flamenco, Royal Andalusian School of Equestrian Art, Alcázar, Cathedral.
- Wine: Sherry wines (Fino, Oloroso, Amontillado, Pedro Ximénez). Knowledge of Bodegas (Tio Pepe, Lustau, Fundador).
- Gastronomy: Tabancos, Tapas, restaurants like La Carboná, Albores, etc.
- Accommodation: Major hotels and areas.
`;

const EMERGENCY_CONTEXT = `
You are "SOS Jerez", a critical response assistant. 
Your ONLY goal is to provide immediate, concise, and accurate information regarding:
- Pharmacies on duty (Farmacias de guardia).
- Hospitals (Hospital Universitario de Jerez).
- Police (Policía Local 092, Nacional 091).
- Emergencies (112).
- Lost items offices.
- Urgent transport.

Do not use flowery language. Be direct. Provide addresses and phone numbers immediately.
ALWAYS use the Google Search tool to find the specific "Farmacia de guardia" for TODAY in Jerez de la Frontera, as this rotates daily.
`;

const getSystemInstruction = (agent: AgentType, tone: ToneType): string => {
  if (agent === AgentType.EMERGENCY) {
    return EMERGENCY_CONTEXT;
  }

  let toneInstruction = "";
  switch (tone) {
    case ToneType.FORMAL:
      toneInstruction = "Use a polite, professional, and respectful tone. Use 'Usted'. Focus on accuracy and elegance.";
      break;
    case ToneType.COLLOQUIAL:
      toneInstruction = "Use a friendly, local tone. You can use mild local expressions ('pisha', 'quillo' sparingly). Be warm and welcoming like a local host.";
      break;
    case ToneType.ENTHUSIASTIC:
      toneInstruction = "Be energetic and very positive! Exclaim about how beautiful Jerez is. Use emojis. Encourage the user to visit everything.";
      break;
  }

  return `${JEREZ_CONTEXT}\n\nCurrent Tone Setting: ${toneInstruction}\nAlways answer in the language the user speaks (default to Spanish if unclear).`;
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  agent: AgentType,
  tone: ToneType
): Promise<{ text: string; groundingUrls: Array<{ uri: string; title: string }> }> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const systemInstruction = getSystemInstruction(agent, tone);
    
    // We use the googleSearch tool to ensure we get up-to-date info on events, opening hours, or pharmacies
    const tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history.map(m => ({ role: m.role, parts: m.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        temperature: agent === AgentType.EMERGENCY ? 0.2 : 0.7, // Lower temp for factual emergency info
      }
    });

    const text = response.text || "Lo siento, no he podido generar una respuesta en este momento.";
    
    // Extract grounding URLs if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title
      }));

    return { text, groundingUrls };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};