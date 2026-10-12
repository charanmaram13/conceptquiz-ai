const API_BASE = '/api';

/**
 * Handle API error responses consistently
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Request failed with status ${response.status}`);
    error.code = data.error?.code || 'API_ERROR';
    error.details = data.error?.details;
    error.isSampleFallbackAvailable = data.error?.isSampleFallbackAvailable;
    throw error;
  }
  return data.data;
}

/**
 * Check backend and AI provider health status (including metrics & stats)
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      status: 'offline',
      provider: {
        provider: 'none',
        isAvailable: false,
        message: 'Backend server is not reachable. Ensure server is running.'
      }
    };
  }
}

/**
 * Fetch real AI quality and performance metrics
 */
export async function getAIMetrics() {
  try {
    const res = await fetch(`${API_BASE}/metrics`);
    return handleResponse(res);
  } catch (err) {
    return null;
  }
}

/**
 * Fetch authoritative backend statistics
 */
export async function getBackendStats() {
  try {
    const res = await fetch(`${API_BASE}/quizzes/stats`);
    return handleResponse(res);
  } catch (err) {
    return null;
  }
}

/**
 * Request AI to generate a new quiz (Standard, Adaptive, or Image Notes)
 */
export async function generateQuiz({
  concept,
  subject,
  difficulty,
  questionCount,
  useSampleFallback = false,
  adaptiveContext = null,
  excludeQuestions = [],
  imageNotes = null
}) {
  const payload = {
    concept,
    subject,
    difficulty,
    questionCount: Number(questionCount),
    useSampleFallback
  };

  if (adaptiveContext) {
    payload.adaptiveContext = adaptiveContext;
  }
  if (Array.isArray(excludeQuestions) && excludeQuestions.length > 0) {
    payload.excludeQuestions = excludeQuestions;
  }
  if (imageNotes) {
    payload.imageNotes = imageNotes;
  }

  const response = await fetch(`${API_BASE}/quizzes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

/**
 * Submit answers for server-side grading and analysis
 */
export async function submitQuiz({ quizId, answers, timeSpentSeconds = 0 }) {
  const response = await fetch(`${API_BASE}/quizzes/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quizId,
      answers,
      timeSpentSeconds
    })
  });

  return handleResponse(response);
}

/**
 * Fetch list of curated sample quizzes
 */
export async function getSampleQuizzes() {
  const response = await fetch(`${API_BASE}/quizzes/samples`);
  return handleResponse(response);
}
