import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada.');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// System instruction: Adaptable, clear for 6th grade and up, no exaggerated complex jargon for simple arithmetic
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

// Ultra-fast official models in order of priority: gemini-3.1-flash-lite gives sub-second responses
const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
];

async function generateWithFallback(ai: GoogleGenAI, contents: any[], systemInstruction: string) {
  let lastError: any = null;

  for (const model of MODELS) {
    try {
      console.log(`[Math AI] Generando con modelo de alta velocidad: ${model}`);
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

      // Per-model timeout race to avoid stalling if a single endpoint has network jitter
      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout tras 25s en modelo ${model}`)), 25000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Math AI] Error o timeout en ${model}: ${err?.message || err}. Probando modelo de respaldo...`);
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del modelo de IA.');
}

// Background warmup to eliminate cold-start latency for the user's first message
function warmupModel() {
  try {
    const ai = getAIClient();
    ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      config: { temperature: 0.1 },
    }).then(() => {
      console.log('[Math AI] Warmup inicial completado con éxito.');
    }).catch((e) => {
      console.log('[Math AI] Warmup en segundo plano:', e?.message || e);
    });
  } catch (e) {
    // Ignore warmup error if key is not yet ready at load
  }
}

app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensajes inválido.' });
    }

    const ai = getAIClient();

    // Limit conversation context to the latest 12 messages for ultra-fast processing
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
    res.json({ text });
  } catch (error: any) {
    console.error('Error en /api/tutor/chat:', error);
    res.status(500).json({
      error: error?.message || 'Error al procesar la respuesta.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server running on http://localhost:${PORT}`);
    // Warm up model in background to eliminate first-message lag
    warmupModel();
  });
}

startServer();
