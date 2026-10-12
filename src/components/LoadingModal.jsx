import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  'Parsing conceptual scope and prerequisite bounds...',
  'Synthesizing rigorous pedagogical questions...',
  'Engineering plausible distractors and common pitfalls...',
  'Generating comprehensive step-by-step explanations...',
  'Validating schema integrity and server-side encryption...'
];

export default function LoadingModal({ concept, difficulty, questionCount }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1915]/50 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 border border-[#E6DFD3] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated Brain Badge Container */}
          <div className="relative mb-5">
            <div className="w-18 h-18 rounded-2xl bg-[#EAE6F8] border border-[#CEC6F0] flex items-center justify-center shadow-sm">
              <Brain className="w-9 h-9 text-[#4A3B83] animate-pulse" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-[#1A1915] text-[#F8F5EF] shadow">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#1A1915] mb-1">
            Crafting Study Assessment
          </h3>
          <p className="text-sm font-medium text-[#4A3B83] mb-3">
            &ldquo;{concept}&rdquo;
          </p>

          <div className="flex items-center gap-2 text-xs mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FDE8E1] text-[#8C3A27] border border-[#F7C4B7] font-medium text-[11px]">
              {difficulty}
            </span>
            <span className="text-[#A39D90]">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3D6] text-[#78570A] border border-[#F9E09B] font-medium text-[11px]">
              {questionCount} Questions
            </span>
            <span className="text-[#A39D90]">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E0EDF8] text-[#204E74] border border-[#B8D7EF] font-mono font-semibold text-[11px]">
              {elapsedSeconds}s
            </span>
          </div>

          {/* Stepped Progress List */}
          <div className="w-full space-y-2 text-left mb-6">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all text-xs ${
                    isCurrent
                      ? 'bg-[#F4EFE6] border border-[#E6DFD3] text-[#1A1915] font-medium shadow-sm'
                      : isPast
                      ? 'bg-[#E3ECE1]/60 border border-[#D2E2CF] text-[#2F522B]'
                      : 'opacity-40 text-[#8C867C]'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2F522B] flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#4A3B83] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D5CFC3] flex-shrink-0" />
                  )}
                  <span className="truncate">{step}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#7A756D] italic">
            Calibrated with pedagogical rubrics and distractor validation.
          </p>
        </div>
      </div>
    </div>
  );
}
