import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
const allowedOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// API Routes
app.use('/api', quizRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ConceptQuiz AI API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      samples: 'GET /api/quizzes/samples',
      generate: 'POST /api/quizzes/generate',
      submit: 'POST /api/quizzes/submit'
    }
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ConceptQuiz AI Server running on http://localhost:${PORT}`);
  console.log(`📡 AI Provider: ${process.env.AI_PROVIDER || 'gemini'} | Model: ${process.env.GEMINI_MODEL || 'gemma-2-27b-it'}`);
  console.log(`🔑 API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

export default app;
