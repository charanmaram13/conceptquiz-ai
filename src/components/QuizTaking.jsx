import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft, Send, ShieldCheck } from 'lucide-react';

export default function QuizTaking({
  quizData,
  onCancel,
  onSubmitAnswers,
  isSubmitting
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questions = quizData.questions || [];
  const total = questions.length;
  const currentQuestion = questions[currentIndex] || {};

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option) => {
    if (isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => selectedAnswers[qId] !== undefined && selectedAnswers[qId] !== null
  ).length;

  const unansweredCount = total - answeredCount;
  const progressPercent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    onSubmitAnswers({
      quizId: quizData.quizId,
      answers: selectedAnswers,
      timeSpentSeconds: elapsedSeconds
    });
  };

  const OPTION_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card: Title, Difficulty, Timer, Progress */}
      <div className="editorial-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2.5 rounded-xl bg-white border border-[#E6DFD3] text-[#7A7468] hover:text-[#1A1915] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
            title="Leave Quiz"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif text-[#1A1915] truncate max-w-xs sm:max-w-md">
                {quizData.concept}
              </h2>
              {quizData.isSample ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FEF3D6] text-[#78570A] border border-[#F9E09B]">
                  Demo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAE6F8] text-[#4A3B83] border border-[#CEC6F0]">
                  Live AI
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7A7468] mt-0.5">
              <span>{quizData.subject || 'Computer Science'}</span>
              <span>•</span>
              <span className="font-medium text-[#1A1915]">{quizData.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 border-[#E6DFD3] pt-3 sm:pt-0">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3EFE6] border border-[#E6DFD3] text-[#423E36] text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-[#7A7468]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Question counter */}
          <div className="text-xs text-[#7A7468] font-medium">
            Question <span className="text-[#1A1915] font-bold">{currentIndex + 1}</span> of{' '}
            <span>{total}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E6DFD3] h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1A1915] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Layout: Question Card + Navigation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question & Options Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="editorial-card rounded-3xl p-6 sm:p-9 relative min-h-[420px] flex flex-col justify-between">
            <div>
              {/* Question Subtopic Badge */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] text-[#5C584E] text-xs font-medium">
                  Subtopic: {currentQuestion.subtopic || 'Concept Application'}
                </span>
                <span className="text-xs text-[#7A7468]">
                  {selectedAnswers[currentQuestion.id] ? (
                    <span className="text-[#2F522B] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#396335]" /> Answer Selected
                    </span>
                  ) : (
                    'Unanswered'
                  )}
                </span>
              </div>

              {/* Question Statement in Serif */}
              <h3 className="text-xl sm:text-2xl font-serif text-[#1A1915] leading-relaxed mb-7 tracking-tight">
                {currentQuestion.question}
              </h3>

              {/* Four Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option;
                  const label = OPTION_LABELS[optIdx] || optIdx + 1;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-start gap-3.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF8F5] border-[#1A1915] ring-2 ring-[#1A1915] shadow-sm'
                          : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#2C2923] hover:border-[#1A1915] hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#1A1915] text-[#F8F5EF]'
                            : 'bg-white text-[#5C584E] border border-[#DDD5C7]'
                        }`}
                      >
                        {label}
                      </div>
                      <div className="text-sm font-medium leading-relaxed pt-0.5 flex-1 text-[#1A1915]">
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Previous, Next, Submit */}
            <div className="flex items-center justify-between gap-3 pt-6 mt-8 border-t border-[#E6DFD3]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed text-[#9E9789] bg-white border border-[#E6DFD3]'
                    : 'bg-white hover:bg-[#F3EFE6] text-[#423E36] border border-[#DDD5C7]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < total - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#1A1915] hover:bg-[#2C2923] text-[#F8F5EF] flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#2F522B] hover:bg-[#254222] text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Complete & Grade</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigation Drawer (Right column) */}
        <div className="space-y-4">
          <div className="editorial-card rounded-2xl p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A7468] mb-3.5">
              Study Navigator
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center border cursor-pointer ${
                      isCurrent
                        ? 'bg-[#1A1915] text-[#F8F5EF] border-[#1A1915] shadow-sm'
                        : isAnswered
                        ? 'bg-[#E3ECE1] text-[#2F522B] border-[#C1D7BC]'
                        : 'bg-[#FAF8F5] text-[#7A7468] border-[#DDD5C7] hover:border-[#1A1915] hover:text-[#1A1915]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3.5 border-t border-[#E6DFD3] space-y-2 text-[11px] text-[#6B6559]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1A1915]" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#E3ECE1] border border-[#C1D7BC]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#FAF8F5] border border-[#DDD5C7]" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>

          {/* Quick Submit Card */}
          <div className="editorial-card rounded-2xl p-4.5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7A7468]">Progress</span>
              <span className="font-bold text-[#1A1915]">
                {answeredCount} of {total} answered
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#1A1915] hover:bg-[#2C2923] text-[#F8F5EF] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Grading</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full editorial-card rounded-3xl p-6 sm:p-8 bg-white shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-13 h-13 rounded-2xl bg-[#E3ECE1] text-[#2F522B] border border-[#C1D7BC] mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#1A1915] mb-1">Grade Assessment?</h3>
              <p className="text-xs text-[#7A7468]">
                Your answers will be evaluated on the server with full pedagogical explanations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD3] mb-6 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A7468]">Answered:</span>
                <span className="font-semibold text-[#2F522B]">{answeredCount} of {total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A7468]">Unanswered:</span>
                <span className={`font-semibold ${unansweredCount > 0 ? 'text-[#8D6912]' : 'text-[#7A7468]'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A7468]">Time Elapsed:</span>
                <span className="font-mono text-[#1A1915]">{formatTime(elapsedSeconds)}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#E6DFD3] text-[11px] text-[#78570A] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Unanswered questions will be scored as incorrect.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="py-3 px-4 rounded-xl text-xs font-medium text-[#423E36] bg-white hover:bg-[#F3EFE6] border border-[#DDD5C7] transition-colors cursor-pointer"
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#1A1915] hover:bg-[#2C2923] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
