import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  AlertTriangle,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';

export default function ResultsDashboard({
  results,
  onPracticeAdaptive,
  onRetakeQuiz,
  onNewQuiz,
  onBackToDashboard
}) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const {
    concept,
    subject,
    difficulty,
    score,
    totalQuestions,
    percentage,
    timeSpentSeconds = 0,
    isSample,
    provider,
    weakTopics = [],
    strongTopics = [],
    adaptiveRecommendation,
    detailedReview = []
  } = results;

  // Trigger confetti on great scores
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }
  }, [percentage]);

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAll = (expand) => {
    const nextState = {};
    detailedReview.forEach((q) => {
      nextState[q.id] = expand;
    });
    setExpandedQuestions(nextState);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  // Performance assessment tier
  let tierBadge = {
    title: 'Needs Reinforcement',
    color: 'bg-[#FEF3D6] border-[#F9E09B] text-[#78570A]',
    description: 'Foundational gaps identified. Review the detailed pedagogical notes below.'
  };

  if (percentage >= 85) {
    tierBadge = {
      title: 'Mastery Achieved',
      color: 'bg-[#E3ECE1] border-[#C1D7BC] text-[#2F522B]',
      description: 'Exceptional theoretical fluency and deep conceptual accuracy demonstrated.'
    };
  } else if (percentage >= 65) {
    tierBadge = {
      title: 'Solid Proficiency',
      color: 'bg-[#E0EDF8] border-[#B8D7EF] text-[#204E74]',
      description: 'Strong functional understanding with minor subtopic edge-case opportunities.'
    };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#5C584E] hover:text-[#1A1915] px-3.5 py-2 rounded-xl bg-white border border-[#E6DFD3] hover:bg-[#F3EFE6] transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Study Room</span>
        </button>

        <div className="flex items-center gap-2">
          {isSample ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3D6] text-[#78570A] border border-[#F9E09B]">
              Sample Demonstration
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAE6F8] text-[#4A3B83] border border-[#CEC6F0]">
              Live AI Assessment
            </span>
          )}
          <span className="text-xs text-[#7A7468]">
            Model: <span className="text-[#1A1915] font-mono font-medium">{provider || 'AI'}</span>
          </span>
        </div>
      </div>

      {/* Main Score Report Card */}
      <div className="editorial-card rounded-3xl p-6 sm:p-9 bg-white">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Left: Concept details and performance badge */}
          <div className="text-center md:text-left space-y-3.5 max-w-lg">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tierBadge.color}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{tierBadge.title}</span>
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#1A1915] tracking-tight">
              {concept}
            </h1>

            <p className="text-sm text-[#666259] leading-relaxed">
              {tierBadge.description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2 text-xs text-[#5C584E]">
              <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3]">
                Level: <strong className="text-[#1A1915]">{difficulty}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7A7468]" />
                <span>{formatTime(timeSpentSeconds)}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3]">
                Domain: <strong className="text-[#1A1915]">{subject || 'Computer Science'}</strong>
              </span>
            </div>
          </div>

          {/* Right: Big Editorial Score Pill */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 p-6 rounded-3xl bg-[#FAF8F5] border border-[#E6DFD3] min-w-[200px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468] mb-1">
              Final Score
            </span>
            <div className="text-5xl font-serif text-[#1A1915] tracking-tight my-1">
              {percentage}%
            </div>
            <div className="text-xs font-medium text-[#5C584E]">
              {score} of {totalQuestions} Questions Correct
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Practice Recommendation Panel */}
      <div className="editorial-card rounded-3xl p-6 sm:p-8 bg-[#EAE6F8]/60 border border-[#CEC6F0]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white border border-[#CEC6F0] text-[#4A3B83] mt-1 shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#4A3B83] border border-[#CEC6F0] text-[11px] font-semibold mb-1.5">
                <Sparkles className="w-3 h-3 text-[#574794]" />
                <span>Adaptive Practice Plan</span>
              </div>
              <h2 className="text-xl font-serif text-[#1A1915] tracking-tight">
                Recommended Study Path
              </h2>
              <p className="text-xs text-[#5C584E] mt-1 max-w-xl leading-relaxed">
                {adaptiveRecommendation?.summary || 'Targeted drill calibrated to address your specific conceptual errors.'}
              </p>
            </div>
          </div>

          {/* Adaptive Practice Action Button */}
          {adaptiveRecommendation && (
            <button
              type="button"
              onClick={() => onPracticeAdaptive(adaptiveRecommendation, results)}
              className="px-5 py-3 rounded-2xl font-serif text-sm bg-[#1A1915] hover:bg-[#2C2923] text-[#F8F5EF] shadow-sm flex items-center justify-center gap-2 flex-shrink-0 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#E3ECE1]" />
              <span>Practice Weak Areas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Subtopic Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#CEC6F0]/60">
          {/* Demonstrated Strengths */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#C1D7BC] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2F522B]">
              <CheckCircle2 className="w-4 h-4 text-[#396335]" />
              <span>Demonstrated Strengths ({strongTopics.length})</span>
            </div>
            {strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {strongTopics.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#E3ECE1] text-[#2F522B] border border-[#C1D7BC] text-xs font-medium"
                  >
                    ✓ {item.subtopic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7A7468] italic">No fully mastered subtopics in this test run.</p>
            )}
          </div>

          {/* Priority Review Areas */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#F9E09B] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#78570A]">
              <AlertTriangle className="w-4 h-4 text-[#8D6912]" />
              <span>Focus Areas for Review ({weakTopics.length})</span>
            </div>
            {weakTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {weakTopics.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#FEF3D6] text-[#78570A] border border-[#F9E09B] text-xs font-medium"
                  >
                    ⚠ {item.subtopic} ({item.missed} missed)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#2F522B] font-medium">
                Flawless execution! All evaluated subtopics answered correctly.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif text-[#1A1915]">
              Question-by-Question Notes
            </h3>
            <span className="text-xs text-[#7A7468]">
              ({score} of {totalQuestions} Correct)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="text-[#5C584E] hover:text-[#1A1915] px-2 py-1 rounded hover:bg-[#F3EFE6] transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-[#DDD5C7]">|</span>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="text-[#5C584E] hover:text-[#1A1915] px-2 py-1 rounded hover:bg-[#F3EFE6] transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* List of review cards */}
        <div className="space-y-3.5">
          {detailedReview.map((q, idx) => {
            const isExpanded = Boolean(expandedQuestions[q.id]);
            const isCorrect = q.isCorrect;

            return (
              <div
                key={q.id || idx}
                className={`editorial-card rounded-2xl transition-all ${
                  isCorrect
                    ? 'border-[#C1D7BC] bg-white'
                    : 'border-[#F7C4B7] bg-white'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCorrect ? (
                        <div className="w-6 h-6 rounded-lg bg-[#E3ECE1] text-[#2F522B] border border-[#C1D7BC] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-[#FDE8E1] text-[#8C3A27] border border-[#F7C4B7] flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#7A7468]">
                          Q{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF8F5] text-[#5C584E] border border-[#E6DFD3]">
                          {q.subtopic || 'Concept'}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            isCorrect ? 'text-[#2F522B]' : 'text-[#8C3A27]'
                          }`}
                        >
                          {isCorrect ? 'Correct (+1)' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#1A1915] leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-[#7A7468] p-1 rounded hover:bg-[#E6DFD3] flex-shrink-0 mt-1 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details: Options breakdown + AI explanation */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 space-y-4 pt-2 border-t border-[#E6DFD3]">
                    {/* Options list */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7468] block">
                        Options Evaluation
                      </span>
                      {q.options?.map((opt, optIdx) => {
                        const isUserChoice = q.userAnswer === opt;
                        const isCorrectOption = q.correctAnswer === opt;

                        let style = 'bg-[#FAF8F5] text-[#5C584E] border-[#E6DFD3]';
                        if (isCorrectOption) {
                          style = 'bg-[#E3ECE1] text-[#2F522B] border-[#C1D7BC] font-medium';
                        } else if (isUserChoice && !isCorrect) {
                          style = 'bg-[#FDE8E1] text-[#8C3A27] border-[#F7C4B7] font-medium';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${style}`}
                          >
                            <span className="font-mono font-bold text-[#5C584E]">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectOption && (
                              <span className="px-2 py-0.5 rounded bg-[#C1D7BC] text-[#2F522B] text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                                Correct Key
                              </span>
                            )}
                            {isUserChoice && !isCorrectOption && (
                              <span className="px-2 py-0.5 rounded bg-[#F7C4B7] text-[#8C3A27] text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Pedagogical Explanation */}
                    <div className="p-4 rounded-2xl bg-[#FEF3D6] border border-[#F9E09B] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78570A]">
                        <Lightbulb className="w-3.5 h-3.5 text-[#8D6912]" />
                        <span>Pedagogical Analysis & Rationale</span>
                      </div>
                      <p className="text-xs text-[#4A380B] leading-relaxed font-sans">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-[#E6DFD3]">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-[#423E36] bg-white hover:bg-[#F3EFE6] border border-[#DDD5C7] transition-colors cursor-pointer shadow-sm"
        >
          Return to Study Room
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRetakeQuiz}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-semibold text-[#423E36] bg-white hover:bg-[#F3EFE6] border border-[#DDD5C7] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake This Quiz</span>
          </button>

          <button
            type="button"
            onClick={onNewQuiz}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#1A1915] hover:bg-[#2C2923] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E3ECE1]" />
            <span>Explore New Topic</span>
          </button>
        </div>
      </div>
    </div>
  );
}
