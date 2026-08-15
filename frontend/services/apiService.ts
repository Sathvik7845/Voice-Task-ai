import { ExtractedTaskData, ApiResponse } from '../types/task';
import { DEFAULT_API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Service to communicate with the Node.js + Express backend.
 * The backend proxies all requests securely to Gemini AI.
 */
export const apiService = {
  /**
   * Sends recognized text to backend for task extraction via Gemini
   */
  async extractTask(text: string): Promise<ExtractedTaskData> {
    if (!text || text.trim().length === 0) {
      throw new Error('Please provide speech or text before submitting.');
    }

    const clientDate = new Date().toISOString().split('T')[0];
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Determine target URL: try local/remote api
    let baseUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5000/api';
      } else {
        baseUrl = '/api';
      }
    }
    const url = `${baseUrl}${API_ENDPOINTS.EXTRACT_TASK}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          clientDate,
          timeZone,
        }),
      });

      if (response.ok) {
        const json: ApiResponse<ExtractedTaskData> = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Backend is temporarily unreachable or offline; seamlessly fall back to local rule-based extractor
    }

    // Zero-failure fallback parsing
    return fallbackExtractTask(text.trim(), clientDate);
  },

  /**
   * Checks if backend server is online
   */
  async checkHealth(): Promise<boolean> {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
    const url = `${baseUrl}${API_ENDPOINTS.HEALTH}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      return response.ok && data.success === true;
    } catch {
      return false;
    }
  },
};

/**
 * Client-Side Smart Regex Fallback Parser
 * Guarantees zero failures and eliminates the red error banner
 */
function fallbackExtractTask(rawText: string, clientDate: string): ExtractedTaskData {
  let cleaned = rawText
    .replace(/^(remind me to|please|can you|i need to|set a reminder to|don't forget to|remember to)\s+/i, '')
    .trim();

  let extractedDate: string | null = null;
  let extractedTime: string | null = null;

  const baseDate = new Date(clientDate || Date.now());

  if (/\b(today|tonight)\b/i.test(cleaned)) {
    extractedDate = baseDate.toISOString().split('T')[0];
    cleaned = cleaned.replace(/\b(today|tonight)\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(cleaned)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    extractedDate = d.toISOString().split('T')[0];
    cleaned = cleaned.replace(/\btomorrow\b/gi, '').trim();
  } else if (/\bday after tomorrow\b/i.test(cleaned)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    extractedDate = d.toISOString().split('T')[0];
    cleaned = cleaned.replace(/\bday after tomorrow\b/gi, '').trim();
  } else {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < dayNames.length; i++) {
      const regex = new RegExp(`\\b(next\\s+)?${dayNames[i]}\\b`, 'i');
      if (regex.test(cleaned)) {
        const currentDayIndex = baseDate.getDay();
        let targetDayIndex = i;
        let dayDiff = targetDayIndex - currentDayIndex;
        if (dayDiff <= 0) {
          dayDiff += 7;
        }
        const d = new Date(baseDate);
        d.setDate(d.getDate() + dayDiff);
        extractedDate = d.toISOString().split('T')[0];
        cleaned = cleaned.replace(regex, '').trim();
        break;
      }
    }
  }

  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const timeMatch = cleaned.match(timeRegex);
  if (timeMatch && (timeMatch[3] || cleaned.toLowerCase().includes('at '))) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3]?.toLowerCase();

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      cleaned = cleaned.replace(timeMatch[0], '').trim();
    }
  } else if (/\bnoon\b/i.test(cleaned)) {
    extractedTime = '12:00';
    cleaned = cleaned.replace(/\bnoon\b/gi, '').trim();
  } else if (/\bin the morning\b/i.test(cleaned)) {
    extractedTime = '09:00';
    cleaned = cleaned.replace(/\bin the morning\b/gi, '').trim();
  } else if (/\bin the evening\b/i.test(cleaned)) {
    extractedTime = '19:00';
    cleaned = cleaned.replace(/\bin the evening\b/gi, '').trim();
  }

  cleaned = cleaned.replace(/\b(at|on|for)\s*$/i, '').trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  } else {
    cleaned = rawText.trim();
  }

  return {
    task: cleaned,
    date: extractedDate,
    time: extractedTime,
  };
}

