import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno de Vercel/Hosting.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const MATH_SYSTEM_INSTRUCTION = `Eres Math AI, un asistente de matemáticas amigable, claro y fácil de entender. Tu público principal son estudiantes de 6º de primaria en adelante (secundaria, bachillerato y universidad). Responde SIEMPRE en español.

REGLAS FUNDAMENTALES:
1. SI ES UNA CONVERSACIÓN O SALUDO (ej. "hola", "¿cómo estás?", "¿qué sabes hacer?"):
   - Responde de forma amable, natural y breve como un asistente de matemáticas.
   - NO inventes fórmulas complicadas ni digas axiomas si solo te están saludando o preguntando algo general.

2. SI ES UNA OPERACIÓN O PROBLEMA MATEMÁTICO:
   - Adapta el nivel:
     * Si es una operación simple (ej. "1+1", "15*4", "cuánto es la raíz de 49"): Resuélvela de forma DIRECTA, SENCILLA y RÁPIDA sin meter teorías complejas, axiomas de Peano o lenguaje universitario innecesario.
     * Si es un problema escolar o de álgebra/cálculo: Explica el procedimiento paso a paso con palabras sencillas y comprensibles para un estudiante.
   - Estructura de respuesta para problemas/operaciones:
     * **Procedimiento / Paso a paso**: Muestra claramente cómo se resuelve (usando $ para fórmulas en línea y $$ para fórmulas en bloque).
     * **Resultado**: Al final de cada problema o ejercicio, destaca claramente la solución o resultado final.

3. FORMATO LIMPIO:
   - Usa siempre LaTeX limpio ($ y $$) para que los números, fracciones y signos matemáticos se vean bonitos.
   - Lenguaje claro, positivo y motivador.`;

const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
];

async function generateWithFallback(ai: GoogleGenAI, contents: any[], systemInstruction: string) {
  let lastError: any = null;

  for (const model of MODELS) {
    try {
      const isFlash37 = model === 'gemini-3.7-flash';
      const config: any = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        temperature: 0.3,
      };

      if (isFlash37) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout en modelo ${model}`)), 12000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del modelo de IA.');
}

export default async function handler(req: any, res: any) {
  // Support CORS if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensajes inválido.' });
    }

    const ai = getAIClient();
    const recentMessages = messages.slice(-12);

    const contents = recentMessages
      .map((m: any) => {
        const parts: any[] = [];

        if (m.image && m.image.data && m.image.mimeType) {
          parts.push({
            inlineData: {
              mimeType: m.image.mimeType,
              data: m.image.data,
            },
          });
        }

        if (m.content && typeof m.content === 'string' && m.content.trim().length > 0) {
          parts.push({ text: m.content });
        }

        if (parts.length === 0) {
          return null;
        }

        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts,
        };
      })
      .filter(Boolean);

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No hay contenido válido para procesar.' });
    }

    const text = await generateWithFallback(ai, contents, MATH_SYSTEM_INSTRUCTION);
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error en Vercel Serverless Function /api/tutor/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar la respuesta con la IA.',
    });
  }
}
