import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import QuizConfigCard from './components/QuizConfigCard';
import RecentHistoryList from './components/RecentHistoryList';
import LoadingModal from './components/LoadingModal';
import QuizTaking from './components/QuizTaking';
import ResultsDashboard from './components/ResultsDashboard';
import MyQuizzesView from './components/MyQuizzesView';
import AnalyticsView from './components/AnalyticsView';
import InfoModal from './components/InfoModal';
import { checkHealth, generateQuiz, submitQuiz } from './services/api';
import {
  getQuizHistory,
  saveQuizResult,
  clearQuizHistory,
  deleteQuizFromHistory,
  getAggregateStatistics
} from './services/storage';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'analytics'
  const [currentView, setCurrentView] = useState('config'); // 'config' | 'taking' | 'results'

  // Quiz Form Configuration
  const [concept, setConcept] = useState('React Hooks');
  const [subject, setSubject] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  // Runtime Assessment Data
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [activeResults, setActiveResults] = useState(null);

  // Adaptive Learning & Vision Context
  const [adaptiveContext, setAdaptiveContext] = useState(null);
  const [imageNotes, setImageNotes] = useState(null);

  // Status & Metrics
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Persisted History & Stats
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    strongestTopic: 'None yet',
    totalQuestionsAnswered: 0,
    perfectScores: 0
  });

  // Initial Load: check health and load saved storage
  useEffect(() => {
    refreshHistoryAndStats();
    loadHealth();
  }, []);

  const loadHealth = async () => {
    const health = await checkHealth();
    setHealthData(health);
  };

  const refreshHistoryAndStats = () => {
    const items = getQuizHistory();
    const aggregate = getAggregateStatistics();
    setHistory(items);
    setStats(aggregate);
  };

  // Generate Quiz Handler
  const handleGenerateQuiz = async ({
    useSampleFallback = false,
    adaptiveContext: overrideAdaptive = adaptiveContext,
    imageNotes: overrideImage = imageNotes
  } = {}) => {
    if (!concept.trim() && !overrideImage) return;

    setError(null);
    setIsLoading(true);

    try {
      const data = await generateQuiz({
        concept: (concept || 'Study Notes').trim(),
        subject,
        difficulty,
        questionCount,
        useSampleFallback,
        adaptiveContext: overrideAdaptive,
        excludeQuestions: activeResults?.detailedReview?.map((r) => r.question) || [],
        imageNotes: overrideImage
      });

      setActiveQuizData(data);
      setAdaptiveContext(null);
      setImageNotes(null);
      setCurrentView('taking');
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Quiz Answers Handler
  const handleSubmitAnswers = async ({ quizId, answers, timeSpentSeconds }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const graded = await submitQuiz({
        quizId,
        answers,
        timeSpentSeconds
      });

      // Save to localStorage
      saveQuizResult(graded);
      refreshHistoryAndStats();

      setActiveResults(graded);
      setCurrentView('results');
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert(`Submission failed: ${err.message || 'Could not verify answers.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adaptive Practice: Drill weak areas
  const handlePracticeAdaptive = (recommendation, fullResults) => {
    const resultsObj = fullResults || activeResults;

    if (recommendation?.suggestedConcept) {
      setConcept(recommendation.suggestedConcept);
    }
    if (recommendation?.suggestedDifficulty) {
      setDifficulty(recommendation.suggestedDifficulty);
    }

    if (resultsObj) {
      const weakTopics = resultsObj.weakTopics?.map((w) => w.subtopic) || [];
      const missed = resultsObj.detailedReview
        ?.filter((r) => !r.isCorrect)
        ?.map((r) => ({
          question: r.question,
          userAnswer: r.userAnswer,
          correctAnswer: r.correctAnswer
        })) || [];

      setAdaptiveContext({
        weakTopics,
        missedQuestions: missed
      });
    }

    setCurrentView('config');
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake current concept
  const handleRetakeQuiz = () => {
    handleGenerateQuiz({ useSampleFallback: activeResults?.isSample });
  };

  // Start new concept
  const handleNewQuiz = () => {
    setCurrentView('config');
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reopen a past result from history
  const handleOpenResult = (savedResult) => {
    setActiveResults(savedResult);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved quiz results and statistics?')) {
      clearQuizHistory();
      refreshHistoryAndStats();
    }
  };

  // Delete a single historical record
  const handleDeleteEntry = (id) => {
    deleteQuizFromHistory(id);
    refreshHistoryAndStats();
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#1A1915] flex flex-col font-sans selection:bg-[#EAE6F8] selection:text-[#1A1915]">
      {/* Top Navigation */}
      <Navbar
        healthData={healthData}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onSelectSample={() => handleGenerateQuiz({ useSampleFallback: true })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay */}
        {isLoading && (
          <LoadingModal
            concept={concept}
            difficulty={difficulty}
            questionCount={questionCount}
          />
        )}

        {/* View 1: Active Quiz Taking Mode */}
        {currentView === 'taking' && activeQuizData ? (
          <QuizTaking
            quizData={activeQuizData}
            onCancel={() => {
              if (window.confirm('Are you sure you want to exit? Your progress will be discarded.')) {
                setCurrentView('config');
              }
            }}
            onSubmitAnswers={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        ) : currentView === 'results' && activeResults ? (
          /* View 2: Graded Results & Adaptive Practice Dashboard */
          <ResultsDashboard
            results={activeResults}
            onPracticeAdaptive={handlePracticeAdaptive}
            onRetakeQuiz={handleRetakeQuiz}
            onNewQuiz={handleNewQuiz}
            onBackToDashboard={() => setCurrentView('config')}
          />
        ) : (
          /* View 3: Dashboard Layout with Sidebar and Main Panels */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Navigation */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
              onQuickSelect={(topic) => {
                setConcept(topic);
                setCurrentView('config');
              }}
            />

            {/* Main Panel Content */}
            <div className="flex-1 space-y-8 min-w-0">
              {activeTab === 'dashboard' && (
                <>
                  {/* High Level Stats Tiles */}
                  <StatsCards stats={stats} />

                  {/* Main Quiz Configuration Card */}
                  <QuizConfigCard
                    concept={concept}
                    setConcept={setConcept}
                    subject={subject}
                    setSubject={setSubject}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    questionCount={questionCount}
                    setQuestionCount={setQuestionCount}
                    onGenerateQuiz={handleGenerateQuiz}
                    isLoading={isLoading}
                    error={error}
                    healthData={healthData}
                    adaptiveContext={adaptiveContext}
                    onClearAdaptiveContext={() => setAdaptiveContext(null)}
                    imageNotes={imageNotes}
                    setImageNotes={setImageNotes}
                  />

                  {/* Recent Quiz History */}
                  <RecentHistoryList
                    history={history}
                    onOpenResult={handleOpenResult}
                    onClearHistory={handleClearHistory}
                    onDeleteEntry={handleDeleteEntry}
                  />
                </>
              )}

              {activeTab === 'history' && (
                <MyQuizzesView
                  history={history}
                  onOpenResult={handleOpenResult}
                  onDeleteEntry={handleDeleteEntry}
                  onClearHistory={handleClearHistory}
                  onStartNew={() => {
                    setActiveTab('dashboard');
                    setCurrentView('config');
                  }}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  stats={stats}
                  history={history}
                  onStartQuizWithConcept={(conceptToTest) => {
                    setConcept(conceptToTest);
                    setAdaptiveContext({
                      weakTopics: [conceptToTest],
                      missedQuestions: []
                    });
                    setActiveTab('dashboard');
                    setCurrentView('config');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Info & Architecture Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        healthData={healthData}
      />

      {/* Footer */}
      <footer className="border-t border-[#E6DFD3] bg-[#F4EFE6] py-8 mt-16 text-xs text-[#7A756D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-bold text-[#1A1915] text-sm">ConceptQuiz</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E3ECE1] text-[#2F522B] text-[10px] font-semibold tracking-wide uppercase border border-[#C1D7BC]">Study Club</span>
            <span>—</span>
            <span>Editorial learning dashboard for conceptual mastery</span>
          </div>
          <div className="flex items-center gap-4 text-[#8C867C]">
            <span>Powered by Google Gemma & Gemini</span>
            <span>•</span>
            <span>Adaptive Pedagogical Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
