import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler middleware for Express backend.
 * Ensures no internal secret keys or stack traces are leaked to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Backend Server Error]:', err.message);

  const errorMessage = err.message || 'Internal Server Error';

  // Differentiate specific known error scenarios
  if (errorMessage.includes('GEMINI_API_KEY is not configured')) {
    res.status(500).json({
      success: false,
      error: 'Backend AI service is not configured. GEMINI_API_KEY is missing.',
    });
    return;
  }

  if (errorMessage.includes('API key') || errorMessage.includes('permission') || errorMessage.includes('quota')) {
    res.status(502).json({
      success: false,
      error: 'AI service communication error. Please check backend API key or try again later.',
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: errorMessage || 'Failed to process voice command. Please try again.',
  });
}
