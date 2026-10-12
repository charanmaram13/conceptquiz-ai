import crypto from 'crypto';
import { getActiveAIProvider } from './aiProvider.js';
import { getSampleQuiz } from './sampleQuizzes.js';

// In-memory session store for active quizzes (correctAnswer and explanations kept strictly on backend)
const quizSessions = new Map();

// Authoritative Backend Quiz Statistics Store
const authoritativeStats = {
  quizzesGenerated: 0,
  quizzesGraded: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  topicPerformance: {},
  recentAttempts: []
};

// Periodic cleanup of expired sessions (> 3 hours old)
setInterval(() => {
  const now = Date.now();
  const maxAge = 3 * 60 * 60 * 1000;
  for (const [id, session] of quizSessions.entries()) {
    if (now - session.createdAt > maxAge) {
      quizSessions.delete(id);
    }
  }
}, 15 * 60 * 1000);

/**
 * Generate a new quiz via AI (or sample fallback if explicitly requested)
 */
export async function createQuiz({
  concept,
  subject,
  difficulty,
  questionCount,
  useSampleFallback = false,
  adaptiveContext = null,
  excludeQuestions = [],
  imageNotes = null
}) {
  let quizData;
  const provider = getActiveAIProvider();

  if (useSampleFallback) {
    quizData = getSampleQuiz(concept, difficulty, questionCount);
  } else {
    try {
      quizData = await provider.generateQuiz({
        concept,
        subject,
        difficulty,
        questionCount,
        adaptiveContext,
        excludeQuestions,
        imageNotes
      });
    } catch (err) {
      throw err;
    }
  }

  const quizId = crypto.randomUUID();

  // Store complete answer key & explanations on the server ONLY
  quizSessions.set(quizId, {
    quizId,
    createdAt: Date.now(),
    concept: quizData.concept,
    subject: quizData.subject,
    difficulty: quizData.difficulty,
    questionCount: quizData.questions.length,
    isSample: Boolean(quizData.isSample),
    provider: quizData.provider || 'AI',
    mode: quizData.mode || 'standard',
    fullQuestions: quizData.questions
  });

  authoritativeStats.quizzesGenerated++;

  // Client gets questions WITHOUT correctAnswer and WITHOUT explanation
  const clientQuestions = quizData.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    subtopic: q.subtopic
  }));

  return {
    quizId,
    concept: quizData.concept,
    subject: quizData.subject,
    difficulty: quizData.difficulty,
    questionCount: clientQuestions.length,
    isSample: Boolean(quizData.isSample),
    provider: quizData.provider || 'AI',
    mode: quizData.mode || 'standard',
    questions: clientQuestions,
    perf: quizData.perf
  };
}

/**
 * Submit and grade a quiz authoritatively on the backend
 */
export async function gradeQuiz({ quizId, answers = {}, timeSpentSeconds = 0 }) {
  const session = quizSessions.get(quizId);

  if (!session) {
    const notFoundErr = new Error('Quiz session expired or not found. Please generate a new quiz to continue.');
    notFoundErr.code = 'SESSION_NOT_FOUND';
    notFoundErr.status = 404;
    throw notFoundErr;
  }

  const { fullQuestions, concept, subject, difficulty, isSample, provider, mode } = session;
  let correctCount = 0;
  const detailedReview = [];
  const subtopicStats = {};

  for (const q of fullQuestions) {
    const userAnswer = answers[q.id] || null;
    const isCorrect = userAnswer === q.correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    // Track subtopic stats
    const subtopic = q.subtopic || 'General';
    if (!subtopicStats[subtopic]) {
      subtopicStats[subtopic] = { total: 0, correct: 0, wrong: 0 };
    }
    subtopicStats[subtopic].total++;
    if (isCorrect) {
      subtopicStats[subtopic].correct++;
    } else {
      subtopicStats[subtopic].wrong++;
    }

    detailedReview.push({
      id: q.id,
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
      subtopic: q.subtopic
    });
  }

  const totalQuestions = fullQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Determine weak and strong topics based on actual user errors
  const weakTopics = [];
  const strongTopics = [];

  for (const [subtopic, stat] of Object.entries(subtopicStats)) {
    if (stat.wrong > 0) {
      weakTopics.push({
        subtopic,
        missed: stat.wrong,
        total: stat.total,
        accuracy: Math.round((stat.correct / stat.total) * 100)
      });
    } else {
      strongTopics.push({
        subtopic,
        correct: stat.correct,
        total: stat.total,
        accuracy: 100
      });
    }
  }

  // Generate adaptive recommendation
  const adaptiveRecommendation = generateAdaptiveRecommendation({
    concept,
    difficulty,
    percentage,
    weakTopics,
    strongTopics
  });

  // Update authoritative backend statistics
  authoritativeStats.quizzesGraded++;
  authoritativeStats.totalQuestionsAnswered += totalQuestions;
  authoritativeStats.totalCorrectAnswers += correctCount;

  if (!authoritativeStats.topicPerformance[concept]) {
    authoritativeStats.topicPerformance[concept] = {
      attempts: 0,
      totalQuestions: 0,
      correctAnswers: 0
    };
  }
  authoritativeStats.topicPerformance[concept].attempts++;
  authoritativeStats.topicPerformance[concept].totalQuestions += totalQuestions;
  authoritativeStats.topicPerformance[concept].correctAnswers += correctCount;

  authoritativeStats.recentAttempts.unshift({
    quizId,
    concept,
    score: correctCount,
    totalQuestions,
    percentage,
    date: new Date().toISOString()
  });
  if (authoritativeStats.recentAttempts.length > 20) {
    authoritativeStats.recentAttempts.pop();
  }

  return {
    quizId,
    concept,
    subject,
    difficulty,
    isSample,
    provider,
    mode,
    submittedAt: new Date().toISOString(),
    score: correctCount,
    totalQuestions,
    percentage,
    timeSpentSeconds,
    weakTopics,
    strongTopics,
    adaptiveRecommendation,
    detailedReview
  };
}

/**
 * Get authoritative statistics maintained by the backend
 */
export function getAuthoritativeStats() {
  const totalAnswered = authoritativeStats.totalQuestionsAnswered;
  const totalCorrect = authoritativeStats.totalCorrectAnswers;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return {
    quizzesGenerated: authoritativeStats.quizzesGenerated,
    quizzesGraded: authoritativeStats.quizzesGraded,
    totalQuestionsAnswered: totalAnswered,
    totalCorrectAnswers: totalCorrect,
    overallAccuracyPercent: accuracy,
    activeSessionsCount: quizSessions.size,
    topicPerformance: authoritativeStats.topicPerformance,
    recentAttempts: authoritativeStats.recentAttempts.slice(0, 5)
  };
}

/**
 * Derive intelligent adaptive practice suggestions based on quiz performance
 */
function generateAdaptiveRecommendation({ concept, difficulty, percentage, weakTopics, strongTopics }) {
  let nextDifficulty = difficulty;
  let summary = '';
  let suggestedTargetConcept = concept;

  if (percentage >= 80) {
    if (difficulty === 'Beginner') nextDifficulty = 'Intermediate';
    else if (difficulty === 'Intermediate') nextDifficulty = 'Advanced';
    else nextDifficulty = 'Advanced';

    summary = `Exceptional mastery! You scored ${percentage}%. You have demonstrated solid command of "${concept}". We recommend advancing to ${nextDifficulty} difficulty for deeper edge cases and architectural trade-offs.`;
  } else if (percentage >= 60) {
    summary = `Good progress! You scored ${percentage}%. You have a working foundation in "${concept}", but specific subtopics require targeted review.`;
    nextDifficulty = difficulty;
  } else {
    if (difficulty === 'Advanced') nextDifficulty = 'Intermediate';
    else if (difficulty === 'Intermediate') nextDifficulty = 'Beginner';
    else nextDifficulty = 'Beginner';

    summary = `Foundational concepts need reinforcement (${percentage}%). We recommend focusing on the core fundamentals of "${concept}" at ${nextDifficulty} difficulty before tackling more complex questions.`;
  }

  if (weakTopics.length > 0) {
    const primaryWeak = weakTopics[0].subtopic;
    suggestedTargetConcept = `${concept}: ${primaryWeak}`;
  }

  return {
    suggestedConcept: suggestedTargetConcept,
    suggestedDifficulty: nextDifficulty,
    summary,
    actionLabel: weakTopics.length > 0 ? `Target Weak Areas (${weakTopics.map(w => w.subtopic).join(', ')})` : `Level Up to ${nextDifficulty}`,
    focusAreas: weakTopics.map((w) => w.subtopic)
  };
}
