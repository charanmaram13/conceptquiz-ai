import express from 'express';
import { generateQuizSchema, submitQuizSchema } from '../validators/quizValidator.js';
import { createQuiz, gradeQuiz, getAuthoritativeStats } from '../services/quizService.js';
import { getActiveAIProvider } from '../services/aiProvider.js';
import { aiMetrics } from '../services/aiMetricsService.js';
import { SAMPLE_QUIZZES } from '../services/sampleQuizzes.js';

const router = express.Router();

/**
 * Health check endpoint with real AI metrics & backend stats
 * GET /api/health
 */
router.get('/health', async (req, res, next) => {
  try {
    const provider = getActiveAIProvider();
    const health = await provider.checkHealth();
    const metrics = aiMetrics.getMetrics();
    const stats = getAuthoritativeStats();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      provider: health,
      metrics,
      authoritativeStats: stats
    });
  } catch (err) {
    res.json({
      success: true,
      status: 'degraded',
      timestamp: new Date().toISOString(),
      provider: {
        provider: 'unknown',
        isAvailable: false,
        message: err.message
      },
      metrics: aiMetrics.getMetrics(),
      authoritativeStats: getAuthoritativeStats()
    });
  }
});

/**
 * AI Quality & Performance Metrics
 * GET /api/metrics
 */
router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: aiMetrics.getMetrics()
  });
});

/**
 * Authoritative Backend Quiz Statistics
 * GET /api/quizzes/stats
 */
router.get('/quizzes/stats', (req, res) => {
  res.json({
    success: true,
    data: getAuthoritativeStats()
  });
});

/**
 * Available offline sample topics
 * GET /api/quizzes/samples
 */
router.get('/quizzes/samples', (req, res) => {
  const samples = Object.values(SAMPLE_QUIZZES).map((s) => ({
    concept: s.concept,
    subject: s.subject,
    difficulty: s.difficulty,
    questionCount: s.questions.length
  }));

  res.json({
    success: true,
    data: samples
  });
});

/**
 * Generate a new quiz (Standard, Adaptive, or Image Notes)
 * POST /api/quizzes/generate
 */
router.post('/quizzes/generate', async (req, res, next) => {
  try {
    const validatedData = generateQuizSchema.parse(req.body);
    const quiz = await createQuiz(validatedData);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Submit quiz answers and receive authoritative grading & feedback
 * POST /api/quizzes/submit
 */
router.post('/quizzes/submit', async (req, res, next) => {
  try {
    const validatedData = submitQuizSchema.parse(req.body);
    const results = await gradeQuiz(validatedData);

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
});

export default router;
