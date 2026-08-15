import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedTaskData } from '../types/task.js';
import { validateExtractedTask } from '../utils/validation.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in backend .env');
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

export interface ExtractTaskOptions {
  clientDate?: string;
  timeZone?: string;
}

/**
 * Calls the Google Gemini API to extract structured task information from natural language voice input.
 */
export async function extractTaskFromText(
  text: string,
  options: ExtractTaskOptions = {}
): Promise<ExtractedTaskData> {
  const ai = getAiClient();

  // Compute current temporal context dynamically
  const now = new Date();
  const currentDateStr = options.clientDate || now.toISOString().split('T')[0]; // YYYY-MM-DD
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[now.getDay()];
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const timeZone = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const systemInstruction = `You are a high-precision Voice Task Extraction AI assistant for the "VoiceTask AI" application.
Your role is to convert natural language voice commands into a structured JSON task object.

TEMPORAL CONTEXT:
- Today's date: ${currentDateStr} (${dayOfWeek})
- Current local time: ${currentTimeStr}
- Timezone: ${timeZone}

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
5. Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no codeblocks, no explanations.`;

  const prompt = `User voice command: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for deterministic factual extraction
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

    const responseText = response.text;
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Gemini API returned an empty response');
    }

    // Clean any accidental markdown wrap
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      throw new Error(`Failed to parse AI JSON response: ${(parseError as Error).message}. Raw output: ${responseText}`);
    }

    // Backend validation of structured output
    const validation = validateExtractedTask(parsed);
    if (!validation.isValid || !validation.data) {
      throw new Error(validation.error || 'Extracted task failed schema validation');
    }

    return validation.data;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[GeminiService Error]:', err.message);
    throw err;
  }
}
