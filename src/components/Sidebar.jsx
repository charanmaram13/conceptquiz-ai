import React from 'react';
import { Compass, BookOpen, BarChart3, BookmarkCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats, onQuickSelect }) {
  const navItems = [
    { id: 'dashboard', label: 'Study Room', icon: Compass },
    { id: 'history', label: 'My Quizzes', icon: BookOpen, badge: stats.quizzesCompleted },
    { id: 'analytics', label: 'Progress & Stats', icon: BarChart3 }
  ];

  const popularConcepts = [
    { name: 'React Hooks', pastel: 'bg-[#FDE8E1] border-[#F7C4B7] text-[#8C3A27]' },
    { name: 'JavaScript Closures', pastel: 'bg-[#FEF3D6] border-[#F9E09B] text-[#78570A]' },
    { name: 'Data Structures & Algorithms', pastel: 'bg-[#E3ECE1] border-[#C1D7BC] text-[#2F522B]' },
    { name: 'DBMS Normalization', pastel: 'bg-[#E0EDF8] border-[#B8D7EF] text-[#204E74]' },
    { name: 'Operating Systems', pastel: 'bg-[#EAE6F8] border-[#CEC6F0] text-[#4A3B83]' },
    { name: 'Machine Learning', pastel: 'bg-[#F9E3EB] border-[#EFAEC6] text-[#7A284A]' }
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-5">
      {/* Navigation Links */}
      <nav className="editorial-card rounded-2xl p-2.5 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                isActive
                  ? 'bg-[#1A1915] text-[#F8F5EF] shadow-sm'
                  : 'text-[#5C584E] hover:text-[#1A1915] hover:bg-[#F3EFE6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F8F5EF]' : 'text-[#7A7468]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#333029] text-[#F8F5EF]' : 'bg-[#EAE6F8] text-[#574794] border border-[#CEC6F0]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Recommended Topics Section with Pastel Cards */}
      <div className="editorial-card rounded-2xl p-4.5 hidden lg:flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7468]">
          <BookmarkCheck className="w-3.5 h-3.5 text-[#1A1915]" />
          <span>Curated Reading List</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {popularConcepts.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                onQuickSelect(item.name);
                setActiveTab('dashboard');
              }}
              className="text-left text-xs text-[#423E36] hover:text-[#1A1915] hover:bg-[#F3EFE6] px-2.5 py-2 rounded-xl transition-all flex items-center justify-between group border border-transparent hover:border-[#E6DFD3] cursor-pointer"
            >
              <span className="truncate font-medium">{item.name}</span>
              <ArrowRight className="w-3 h-3 text-[#9E9789] group-hover:text-[#1A1915] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Security Assurance Card */}
      <div className="editorial-card rounded-2xl p-4 hidden lg:flex flex-col gap-2 text-xs text-[#6B6559] border-[#E6DFD3]">
        <div className="flex items-center gap-2 text-[#1A1915] font-serif font-normal text-sm">
          <ShieldCheck className="w-4 h-4 text-[#2F522B]" />
          <span>Server-Side Integrity</span>
        </div>
        <p className="leading-relaxed text-[11px] text-[#7A7468]">
          Answer keys are verified on the backend. No grading data leaks into student browser payloads.
        </p>
      </div>
    </aside>
  );
}
