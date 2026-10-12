import React from 'react';
import { Award, Target, Flame, Sparkles } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Sessions Completed',
      value: stats.quizzesCompleted,
      subtitle: stats.quizzesCompleted > 0 ? `${stats.totalQuestionsAnswered} questions solved` : 'Start your first quiz',
      icon: Award,
      bg: 'bg-[#E3ECE1]',
      border: 'border-[#C1D7BC]',
      accent: 'text-[#2F522B]',
      iconBg: 'bg-[#D4E3D1]'
    },
    {
      label: 'Average Accuracy',
      value: stats.quizzesCompleted > 0 ? `${stats.averageScore}%` : '—',
      subtitle: stats.averageScore >= 80 ? 'Mastery territory' : stats.quizzesCompleted > 0 ? 'Consistent practice' : 'Awaiting attempts',
      icon: Target,
      bg: 'bg-[#E0EDF8]',
      border: 'border-[#B8D7EF]',
      accent: 'text-[#204E74]',
      iconBg: 'bg-[#CCE1F4]'
    },
    {
      label: 'Strongest Area',
      value: stats.strongestTopic,
      subtitle: stats.quizzesCompleted > 0 ? 'Highest retention rate' : 'Take a quiz to unlock',
      icon: Flame,
      bg: 'bg-[#FEF3D6]',
      border: 'border-[#F9E09B]',
      accent: 'text-[#78570A]',
      iconBg: 'bg-[#FAE6B2]',
      isTruncated: true
    },
    {
      label: 'Perfect Scores',
      value: stats.perfectScores || 0,
      subtitle: '100% accuracy sessions',
      icon: Sparkles,
      bg: 'bg-[#EAE6F8]',
      border: 'border-[#CEC6F0]',
      accent: 'text-[#4A3B83]',
      iconBg: 'bg-[#DDD6F5]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`${card.bg} border ${card.border} rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#5C584E] uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconBg} ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className={`text-3xl font-serif text-[#1A1915] tracking-tight ${card.isTruncated ? 'truncate text-xl font-sans font-semibold' : ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-[#6B6559] mt-1.5 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
