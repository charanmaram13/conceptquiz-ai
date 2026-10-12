import React from 'react';
import { BookOpen, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function RecentHistoryList({
  history,
  onOpenResult,
  onClearHistory,
  onDeleteEntry
}) {
  if (!history || history.length === 0) {
    return (
      <div className="editorial-card rounded-3xl p-8 sm:p-10 text-center bg-white">
        <div className="w-13 h-13 rounded-2xl bg-[#F3EFE6] border border-[#E6DFD3] text-[#7A7468] mx-auto flex items-center justify-center mb-3.5">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif text-[#1A1915] mb-1">Your Study Journal is Empty</h3>
        <p className="text-xs text-[#7A7468] max-w-sm mx-auto leading-relaxed">
          Synthesize an assessment above to explore concepts, test retention, and build your mastery history.
        </p>
      </div>
    );
  }

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="editorial-card rounded-3xl p-6 sm:p-8 bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD3]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-serif text-[#1A1915]">
            Recent Study Sessions
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F3EFE6] text-[#5C584E] border border-[#E6DFD3]">
            {history.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-[#7A7468] hover:text-[#8C3A27] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Journal</span>
        </button>
      </div>

      <div className="divide-y divide-[#E6DFD3]">
        {history.slice(0, 6).map((item) => {
          const isHigh = item.percentage >= 80;
          const isMid = item.percentage >= 60 && item.percentage < 80;

          return (
            <div
              key={item.id}
              className="py-4 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#FAF8F5] px-3 rounded-2xl transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold font-serif flex-shrink-0 border ${
                    isHigh
                      ? 'bg-[#E3ECE1] text-[#2F522B] border-[#C1D7BC]'
                      : isMid
                      ? 'bg-[#E0EDF8] text-[#204E74] border-[#B8D7EF]'
                      : 'bg-[#FEF3D6] text-[#78570A] border-[#F9E09B]'
                  }`}
                >
                  {item.percentage}%
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#1A1915] group-hover:text-[#4A3B83] transition-colors">
                      {item.concept}
                    </h4>
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
                  <div className="flex items-center gap-2 text-xs text-[#7A7468] mt-1">
                    <span className="font-medium text-[#1A1915]">{item.difficulty}</span>
                    <span>•</span>
                    <span>{item.score} of {item.totalQuestions} questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#9E9789]" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenResult(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F3EFE6] text-xs font-medium text-[#1A1915] border border-[#DDD5C7] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Review Notes</span>
                  <ArrowRight className="w-3 h-3 text-[#7A7468]" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteEntry(item.id)}
                  className="p-1.5 text-[#9E9789] hover:text-[#8C3A27] rounded-lg hover:bg-[#FDE8E1] transition-colors cursor-pointer"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
