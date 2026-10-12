import React from 'react';
import { BarChart3, Target, Flame, Clock, ShieldAlert, ArrowRight, Award, Compass } from 'lucide-react';

export default function AnalyticsView({ stats, history, onStartQuizWithConcept }) {
  const total = history.length;
  const highTier = history.filter((h) => h.percentage >= 80).length;
  const midTier = history.filter((h) => h.percentage >= 60 && h.percentage < 80).length;
  const lowTier = history.filter((h) => h.percentage < 60).length;

  // Aggregate missed subtopics across all history
  const allMissedSubtopics = {};
  history.forEach((h) => {
    (h.weakTopics || []).forEach((w) => {
      allMissedSubtopics[w.subtopic] = (allMissedSubtopics[w.subtopic] || 0) + (w.missed || 1);
    });
  });

  const sortedWeakSubtopics = Object.entries(allMissedSubtopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const totalSeconds = history.reduce((sum, h) => sum + (h.timeSpentSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E6DFD3]">
        <h1 className="text-3xl font-serif text-[#1A1915] tracking-tight">
          Learning Progress & Insights
        </h1>
        <p className="text-xs text-[#7A7468] mt-1">
          Visual metrics reflecting conceptual retention, mastery tiers, and priority focus areas.
        </p>
      </div>

      {/* Top 3 High-Level Metric Tiles (Pastel Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#E0EDF8] border border-[#B8D7EF] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#204E74] uppercase tracking-wider">Average Score</span>
            <Target className="w-4 h-4 text-[#204E74]" />
          </div>
          <div className="text-3xl font-serif text-[#1A1915]">
            {stats.quizzesCompleted > 0 ? `${stats.averageScore}%` : '—'}
          </div>
          <p className="text-xs text-[#5C584E] mt-1 font-medium">
            {stats.quizzesCompleted > 0
              ? `Across ${stats.quizzesCompleted} completed assessments`
              : 'Complete a quiz to unlock'}
          </p>
        </div>

        <div className="bg-[#E3ECE1] border border-[#C1D7BC] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#2F522B] uppercase tracking-wider">Strongest Area</span>
            <Flame className="w-4 h-4 text-[#2F522B]" />
          </div>
          <div className="text-xl font-serif text-[#1A1915] truncate">
            {stats.strongestTopic}
          </div>
          <p className="text-xs text-[#5C584E] mt-1 font-medium">Highest retention frequency</p>
        </div>

        <div className="bg-[#EAE6F8] border border-[#CEC6F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#4A3B83] uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-[#4A3B83]" />
          </div>
          <div className="text-3xl font-serif text-[#1A1915]">
            {totalMinutes} <span className="text-sm font-sans font-normal text-[#5C584E]">min</span>
          </div>
          <p className="text-xs text-[#5C584E] mt-1 font-medium">Active assessment time</p>
        </div>
      </div>

      {/* Mastery Tier Distribution */}
      <div className="editorial-card rounded-3xl p-6 sm:p-8 bg-white space-y-4">
        <h3 className="text-lg font-serif text-[#1A1915] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#1A1915]" />
          <span>Mastery Tier Distribution</span>
        </h3>

        {total === 0 ? (
          <p className="text-xs text-[#7A7468] py-4">No completed study sessions recorded to generate tier analytics.</p>
        ) : (
          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#2F522B]">Mastery Tier (80% - 100%)</span>
                <span className="text-[#5C584E]">{highTier} sessions ({Math.round((highTier / total) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#E6DFD3]">
                <div
                  className="h-full bg-[#82B37B] rounded-full"
                  style={{ width: `${(highTier / total) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#204E74]">Proficient Tier (60% - 79%)</span>
                <span className="text-[#5C584E]">{midTier} sessions ({Math.round((midTier / total) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#E6DFD3]">
                <div
                  className="h-full bg-[#7DAEDB] rounded-full"
                  style={{ width: `${(midTier / total) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#78570A]">Reinforcement Needed (&lt; 60%)</span>
                <span className="text-[#5C584E]">{lowTier} sessions ({Math.round((lowTier / total) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#E6DFD3]">
                <div
                  className="h-full bg-[#E5B84B] rounded-full"
                  style={{ width: `${(lowTier / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recurrent Weak Subtopics Across All Tests */}
      <div className="editorial-card rounded-3xl p-6 sm:p-8 bg-white space-y-4">
        <div>
          <h3 className="text-lg font-serif text-[#1A1915] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#8D6912]" />
            <span>Priority Areas for Future Review</span>
          </h3>
          <p className="text-xs text-[#7A7468] mt-1">
            Aggregated from questions missed across all subjects in your study journal.
          </p>
        </div>

        {sortedWeakSubtopics.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD3] text-center text-xs text-[#7A7468]">
            No recurring weak areas recorded! Complete more quizzes to identify specific study recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {sortedWeakSubtopics.map(([subtopic, count]) => (
              <div
                key={subtopic}
                className="p-4 rounded-2xl bg-[#FEF3D6] border border-[#F9E09B] flex flex-col justify-between gap-3 group transition-all"
              >
                <div>
                  <div className="text-[11px] font-semibold text-[#78570A] mb-1">
                    {count} Missed {count === 1 ? 'Question' : 'Questions'}
                  </div>
                  <h4 className="text-xs font-semibold text-[#1A1915] group-hover:text-[#4A3B83] transition-colors leading-snug">
                    {subtopic}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => onStartQuizWithConcept(subtopic)}
                  className="text-left text-xs font-semibold text-[#78570A] hover:text-[#1A1915] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Practice this concept</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
