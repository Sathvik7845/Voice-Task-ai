import { ExtractedTaskData } from '../types/task.js';

/**
 * Validates the incoming task extraction payload
 */
export function validateExtractRequest(body: unknown): { isValid: boolean; error?: string; text?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object' };
  }

  const { text } = body as { text?: unknown };

  if (typeof text !== 'string') {
    return { isValid: false, error: 'Missing or invalid "text" parameter. A string is required.' };
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return { isValid: false, error: 'Input text cannot be empty. Please provide a voice or text command.' };
  }

  if (trimmedText.length > 1000) {
    return { isValid: false, error: 'Input text is too long (maximum 1000 characters).' };
  }

  return { isValid: true, text: trimmedText };
}

/**
 * Validates and normalizes Gemini's structured response
 */
export function validateExtractedTask(data: unknown): { isValid: boolean; data?: ExtractedTaskData; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'AI returned an invalid non-object response' };
  }

  const raw = data as Record<string, unknown>;

  // 1. Task name validation
  if (typeof raw.task !== 'string' || raw.task.trim().length === 0) {
    return { isValid: false, error: 'AI failed to extract a valid task description' };
  }
  const task = raw.task.trim();

  // 2. Date validation (YYYY-MM-DD or null)
  let date: string | null = null;
  if (raw.date !== null && raw.date !== undefined && raw.date !== '' && raw.date !== 'null') {
    if (typeof raw.date === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(raw.date)) {
        // Confirm valid calendar date
        const parsed = new Date(raw.date + 'T00:00:00Z');
        if (!isNaN(parsed.getTime())) {
          date = raw.date;
        }
      }
    }
  }

  // 3. Time validation (HH:mm or null)
  let time: string | null = null;
  if (raw.time !== null && raw.time !== undefined && raw.time !== '' && raw.time !== 'null') {
    if (typeof raw.time === 'string') {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (timeRegex.test(raw.time)) {
        time = raw.time;
      }
    }
  }

  return {
    isValid: true,
    data: {
      task,
      date,
      time,
    },
  };
}
