import React from 'react';
import { BookOpen, Sparkles, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ healthData, onOpenInfoModal, onSelectSample }) {
  const isAvailable = healthData?.provider?.isAvailable;
  const hasKey = healthData?.provider?.hasKey;
  const isOffline = healthData?.status === 'offline';
  const modelName = healthData?.provider?.model || (healthData === null ? 'Checking...' : isOffline ? 'Backend Offline' : 'Not Configured');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E6DFD3] bg-[#F8F5EF]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#1A1915] text-[#F8F5EF] flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-[#E3ECE1]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-normal text-[#1A1915] font-serif tracking-tight">
                ConceptQuiz
              </span>
              <span className="text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-[#E3ECE1] text-[#2F522B] border border-[#C1D7BC]">
                Study Club
              </span>
            </div>
            <p className="text-xs text-[#7A7468] hidden sm:block font-serif italic">
              A little practice. A lot of progress.
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          {/* AI Connection status badge */}
          <button
            type="button"
            onClick={onOpenInfoModal}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E6DFD3] text-xs transition-all bg-white hover:bg-[#F3EFE6] text-[#423E36] shadow-sm"
            title="Click to view AI Provider & System Health"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8D6912]" />
              <span className="text-[#7A7468] font-medium hidden md:inline">Model:</span>
              <span className="font-mono text-[11px] text-[#1A1915] font-semibold truncate max-w-[120px] sm:max-w-none">
                {modelName}
              </span>
            </div>
            {isAvailable ? (
              <span className="flex items-center gap-1 text-[#2F522B] font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#396335]"></span>
                <span className="hidden sm:inline">Active</span>
              </span>
            ) : isOffline ? (
              <span className="flex items-center gap-1 text-[#A83232] font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A83232]"></span>
                <span className="hidden sm:inline">Offline</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#8D6912] font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4981E]"></span>
                <span className="hidden sm:inline">Demo Ready</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenInfoModal}
            className="p-2 rounded-xl text-[#7A7468] hover:text-[#1A1915] hover:bg-[#F3EFE6] border border-transparent hover:border-[#E6DFD3] transition-colors"
            title="Help & Architecture Info"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
