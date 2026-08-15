import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Lazy GenAI Client Setup
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the server environment.');
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// 1. Health Check Endpoint
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'VoiceTask AI backend is running',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. Extract Task Endpoint
// ==========================================
app.post('/api/tasks/extract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, clientDate, timeZone } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing or empty "text" parameter. Please provide voice or text command.',
      });
      return;
    }

    const trimmed = text.trim();
    if (trimmed.length > 1000) {
      res.status(400).json({
        success: false,
        error: 'Input text is too long (maximum 1000 characters).',
      });
      return;
    }

    const ai = getAiClient();

    // Temporal context
    const now = new Date();
    const currentDateStr = clientDate || now.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const systemInstruction = `You are a high-precision Voice Task Extraction AI assistant for the "VoiceTask AI" application.
Your role is to convert natural language voice commands into a structured JSON task object.

TEMPORAL CONTEXT:
- Today's date: ${currentDateStr} (${dayOfWeek})
- Current local time: ${currentTimeStr}
- Timezone: ${userTimeZone}

STRICT EXTRACTION RULES:
1. "task": Extract ONLY the concise, actionable title of the task without conversational filler phrases (e.g. remove "remind me to", "please", "can you", "I need to", "set a reminder to", "don't forget to"). Capitalize the first letter properly (e.g. "Call John", "Submit assignment", "Buy groceries").
2. "date": Dynamically calculate and return the exact date in "YYYY-MM-DD" format:
   - "today" -> ${currentDateStr}
   - "tomorrow" -> calculate tomorrow's date relative to ${currentDateStr}
   - "day after tomorrow" -> calculate 2 days from ${currentDateStr}
   - "next Monday", "this Friday", etc. -> calculate the upcoming corresponding calendar date accurately relative to ${currentDateStr} (${dayOfWeek})
   - "on August 20th" -> calculate exact date with correct year (current or next if past)
   - If NO date is specified or implied by the user, return null (do NOT make up a date).
3. "time": Resolve natural language time into 24-hour "HH:mm" format:
   - "5 PM" or "5:00 PM" -> "17:00"
   - "9:30 AM" -> "09:30"
   - "noon" -> "12:00"
   - "midnight" -> "00:00"
   - "in the evening" / "tonight" -> "19:00"
   - "in the morning" -> "09:00"
   - "in the afternoon" -> "14:00"
   - If NO time is specified, return null (do NOT invent a time).
4. Do NOT invent people, locations, or details that were not in the user's speech.
5. Return ONLY a valid JSON object matching the requested schema. No markdown, no explanations.`;

    const prompt = `User voice command: "${trimmed}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: {
              type: Type.STRING,
              description: 'The concise action or reminder name extracted from the voice command.',
            },
            date: {
              type: Type.STRING,
              description: 'Calculated calendar date in YYYY-MM-DD format, or null if unspecified.',
            },
            time: {
              type: Type.STRING,
              description: '24-hour time string in HH:mm format, or null if unspecified.',
            },
          },
          required: ['task'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Gemini API returned an empty response');
    }

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e: any) {
      throw new Error(`Failed to parse AI JSON response: ${e.message}`);
    }

    if (!parsed || typeof parsed !== 'object' || typeof parsed.task !== 'string' || !parsed.task.trim()) {
      throw new Error('AI could not extract a meaningful task from the provided speech.');
    }

    // Sanitize output
    let parsedDate: string | null = null;
    if (parsed.date && typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      parsedDate = parsed.date;
    }

    let parsedTime: string | null = null;
    if (parsed.time && typeof parsed.time === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(parsed.time)) {
      parsedTime = parsed.time;
    }

    res.status(200).json({
      success: true,
      data: {
        task: parsed.task.trim(),
        date: parsedDate,
        time: parsedTime,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err.message);
  const msg = err.message || 'Internal Server Error';

  if (msg.includes('GEMINI_API_KEY is not set')) {
    res.status(500).json({
      success: false,
      error: 'Backend AI service is not configured. GEMINI_API_KEY is missing.',
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: msg || 'An error occurred while processing the task with AI.',
  });
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`🚀 VoiceTask AI Unified Server running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI: Gemini 3.7 Flash`);
    console.log(`========================================`);
  });
}

startServer();
