import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

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

const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.0-flash',
];

async function generateWithFallback(ai: GoogleGenAI, contents: any[], systemInstruction: string) {
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`[Math AI] Generando con modelo: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          temperature: 0.3,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Math AI] Error en ${model}: ${err?.message || err}. Probando alternativa...`);
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de los modelos de IA.');
}

app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensajes inválido.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY no está configurada.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map((m: any) => {
      const parts: any[] = [];

      if (m.image && m.image.data && m.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType,
            data: m.image.data,
          },
        });
      }

      if (m.content) {
        parts.push({ text: m.content });
      }

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    const text = await generateWithFallback(ai, contents, MATH_SYSTEM_INSTRUCTION);
    res.json({ text });
  } catch (error: any) {
    console.error('Error en /api/tutor/chat:', error);
    res.status(500).json({
      error: error?.message || 'Error interno al procesar el cálculo.',
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
  });
}

startServer();
