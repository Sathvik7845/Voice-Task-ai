import { ExtractedTaskData, ApiResponse } from '../types';

export const api = {
  async extractTask(text: string): Promise<ExtractedTaskData> {
    if (!text || text.trim().length === 0) {
      throw new Error('Please speak or type a task command before submitting.');
    }

    const clientDate = new Date().toISOString().split('T')[0];
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let parsed: ExtractedTaskData | null = null;

    try {
      const response = await fetch('/api/tasks/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          clientDate,
          timeZone,
        }),
      });

      if (response.ok) {
        const data: ApiResponse<ExtractedTaskData> = await response.json();
        if (data.success && data.data) {
          parsed = data.data;
        }
      }
    } catch {
      // Backend is unreachable, fallback to client-side rule extraction
    }

    if (parsed && parsed.task) {
      return parsed;
    }

    // Client-side rule extraction fallback if server is offline or unreachable
    return localExtractTask(text.trim(), clientDate);
  },

  async checkHealth(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      return { success: response.ok && data.success === true, message: data.message };
    } catch {
      return { success: false, message: 'Server unreachable' };
    }
  },
};

/**
 * Robust Client-Side Regex Extraction Fallback
 * Guarantees zero failures even if backend is offline or network is disconnected.
 */
function localExtractTask(rawText: string, clientDate: string): ExtractedTaskData {
  let cleaned = rawText
    .replace(/^(remind me to|please|can you|i need to|set a reminder to|don't forget to|remember to)\s+/i, '')
    .trim();

  let extractedDate: string | null = null;
  let extractedTime: string | null = null;

  // Date parsing
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
    // Day of week match (e.g. next monday, friday)
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

  // Time parsing (e.g. 5 PM, 5:30 PM, 10 AM, at 4)
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
  } else if (/\bmidnight\b/i.test(cleaned)) {
    extractedTime = '00:00';
    cleaned = cleaned.replace(/\bmidnight\b/gi, '').trim();
  } else if (/\bin the morning\b/i.test(cleaned)) {
    extractedTime = '09:00';
    cleaned = cleaned.replace(/\bin the morning\b/gi, '').trim();
  } else if (/\bin the evening\b/i.test(cleaned)) {
    extractedTime = '19:00';
    cleaned = cleaned.replace(/\bin the evening\b/gi, '').trim();
  }

  // Final cleanup of extra prepositions (e.g., "at", "on", "for")
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
