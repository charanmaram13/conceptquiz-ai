import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  // Log server-side for diagnostics
  console.error(`[API Error] [${req.method} ${req.url}]:`, err.message || err);

  if (err instanceof ZodError) {
    const rawIssues = err.issues || err.errors || [];
    const issues = rawIssues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: issues[0]?.message || 'Invalid request payload',
        details: issues
      }
    });
  }

  const statusCode = err.status || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR');

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred while processing your request.',
      // Only include safe metadata, never stack traces or secret keys
      isSampleFallbackAvailable: err.code === 'MISSING_API_KEY' || err.code === 'AI_GENERATION_FAILED' || err.code === 'MALFORMED_AI_OUTPUT'
    }
  });
}
