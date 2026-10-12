import React, { useState } from 'react';
import { BookOpen, Search, Calendar, Trash2, ArrowRight, Clock } from 'lucide-react';

export default function MyQuizzesView({
  history,
  onOpenResult,
  onDeleteEntry,
  onClearHistory,
  onStartNew
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff =
      difficultyFilter === 'All' || item.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Completed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFD3]">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1915] tracking-tight">
            Study Journal & Archive
          </h1>
          <p className="text-xs text-[#7A7468] mt-1">
            Review past scores, question explanations, and tracked conceptual progress.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E6DFD3] text-xs text-[#7A7468] hover:text-[#8C3A27] hover:border-[#F7C4B7] transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Journal Entries</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="editorial-card rounded-2xl p-4 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#9E9789] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by concept or domain..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-[#1A1915] placeholder-[#9E9789] focus:outline-none focus:ring-2 focus:ring-[#1A1915]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-[#7A7468] font-medium mr-1">Difficulty:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-[#1A1915] text-[#F8F5EF] shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C584E] hover:text-[#1A1915] border border-[#DDD5C7]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* List of Historical Quizzes */}
      {filtered.length === 0 ? (
        <div className="editorial-card rounded-3xl p-12 text-center bg-white">
          <div className="w-13 h-13 rounded-2xl bg-[#F3EFE6] border border-[#E6DFD3] text-[#7A7468] mx-auto flex items-center justify-center mb-3.5">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif text-[#1A1915] mb-1">
            {history.length === 0 ? 'No Quizzes Completed Yet' : 'No Matching Journal Entries Found'}
          </h3>
          <p className="text-xs text-[#7A7468] max-w-sm mx-auto mb-5 leading-relaxed">
            {history.length === 0
              ? 'Complete your first assessment from the study room to record your progress.'
              : 'Try adjusting your search query or difficulty filter.'}
          </p>
          {history.length === 0 && (
            <button
              type="button"
              onClick={onStartNew}
              className="px-5 py-2.5 rounded-xl bg-[#1A1915] hover:bg-[#2C2923] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Start First Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isHigh = item.percentage >= 80;
            const isMid = item.percentage >= 60 && item.percentage < 80;

            return (
              <div
                key={item.id}
                className="editorial-card rounded-2xl p-5.5 bg-white transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[#1A1915] group-hover:text-[#4A3B83] transition-colors">
                          {item.concept}
                        </h3>
                        {item.isSample ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3D6] text-[#78570A] border border-[#F9E09B]">
                            Demo
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE6F8] text-[#4A3B83] border border-[#CEC6F0]">
                            Live AI
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7A7468] mt-0.5">{item.subject}</p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-serif font-bold flex-shrink-0 border ${
                        isHigh
                          ? 'bg-[#E3ECE1] text-[#2F522B] border-[#C1D7BC]'
                          : isMid
                          ? 'bg-[#E0EDF8] text-[#204E74] border-[#B8D7EF]'
                          : 'bg-[#FEF3D6] text-[#78570A] border-[#F9E09B]'
                      }`}
                    >
                      <span className="text-sm">{item.percentage}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A7468] pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E6DFD3] text-[#5C584E]">
                      {item.difficulty}
                    </span>
                    <span>•</span>
                    <span>{item.score} of {item.totalQuestions} correct</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#9E9789]">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-[#E6DFD3]">
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(item.id)}
                    className="text-xs text-[#9E9789] hover:text-[#8C3A27] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenResult(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#DDD5C7] text-xs font-medium text-[#1A1915] transition-colors cursor-pointer"
                  >
                    <span>View Notes</span>
                    <ArrowRight className="w-3 h-3 text-[#7A7468]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
