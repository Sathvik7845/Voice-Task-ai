import { Request, Response, NextFunction } from 'express';
import { extractTaskFromText } from '../services/geminiService.js';
import { validateExtractRequest } from '../utils/validation.js';

/**
 * Controller to handle task extraction from voice/text input
 * POST /api/tasks/extract
 */
export async function extractTaskController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = validateExtractRequest(req.body);
    if (!validation.isValid || !validation.text) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid request payload',
      });
      return;
    }

    const { clientDate, timeZone } = req.body as { clientDate?: string; timeZone?: string };

    const extractedData = await extractTaskFromText(validation.text, {
      clientDate,
      timeZone,
    });

    res.status(200).json({
      success: true,
      data: extractedData,
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Controller for backend health check
 * GET /api/health
 */
export function healthCheckController(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: 'VoiceTask AI backend is running',
    timestamp: new Date().toISOString(),
  });
}
