const STORAGE_KEY = 'conceptquiz_history_v1';

/**
 * Retrieve saved quiz history from localStorage
 */
export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read quiz history from localStorage', err);
    return [];
  }
}

/**
 * Save a newly graded quiz into localStorage
 */
export function saveQuizResult(result) {
  try {
    const current = getQuizHistory();
    const entry = {
      id: result.quizId || `hist_${Date.now()}`,
      date: result.submittedAt || new Date().toISOString(),
      concept: result.concept,
      subject: result.subject || 'Computer Science',
      difficulty: result.difficulty,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      timeSpentSeconds: result.timeSpentSeconds || 0,
      isSample: Boolean(result.isSample),
      provider: result.provider || 'AI',
      weakTopics: result.weakTopics || [],
      strongTopics: result.strongTopics || [],
      adaptiveRecommendation: result.adaptiveRecommendation,
      detailedReview: result.detailedReview || []
    };

    // Filter out if duplicate ID exists, prepend newest first
    const updated = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (err) {
    console.error('Failed to save quiz result', err);
    return null;
  }
}

/**
 * Delete a specific quiz from history
 */
export function deleteQuizFromHistory(id) {
  try {
    const current = getQuizHistory();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete quiz', err);
    return getQuizHistory();
  }
}

/**
 * Clear all quiz history
 */
export function clearQuizHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear quiz history', err);
    return [];
  }
}

/**
 * Compute aggregate statistics across all quizzes
 */
export function getAggregateStatistics() {
  const history = getQuizHistory();

  if (history.length === 0) {
    return {
      quizzesCompleted: 0,
      averageScore: 0,
      strongestTopic: 'None yet',
      totalQuestionsAnswered: 0,
      perfectScores: 0
    };
  }

  const quizzesCompleted = history.length;
  const totalPercentage = history.reduce((sum, item) => sum + (item.percentage || 0), 0);
  const averageScore = Math.round(totalPercentage / quizzesCompleted);
  const totalQuestionsAnswered = history.reduce((sum, item) => sum + (item.totalQuestions || 0), 0);
  const perfectScores = history.filter((item) => item.percentage === 100).length;

  // Compute topic frequency and performance
  const topicStats = {};
  for (const item of history) {
    const topic = item.concept || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = { totalPct: 0, count: 0 };
    }
    topicStats[topic].totalPct += item.percentage || 0;
    topicStats[topic].count += 1;
  }

  let strongestTopic = 'None yet';
  let bestAvg = -1;

  for (const [topic, stat] of Object.entries(topicStats)) {
    const avg = stat.totalPct / stat.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      strongestTopic = topic;
    }
  }

  return {
    quizzesCompleted,
    averageScore,
    strongestTopic,
    totalQuestionsAnswered,
    perfectScores
  };
}
