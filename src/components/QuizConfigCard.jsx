import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, Check, AlertCircle, ArrowUpRight, Image, FileText, CheckCircle2 } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Web Development',
  'Programming Languages',
  'Database Systems',
  'Operating Systems',
  'Machine Learning & AI',
  'Software Architecture'
];

const DIFFICULTY_LEVELS = [
  { id: 'Beginner', label: 'Beginner', desc: 'Core definitions & basics' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Practical trade-offs & mechanics' },
  { id: 'Advanced', label: 'Advanced', desc: 'Edge cases & internal architecture' }
];

const QUESTION_COUNTS = [5, 10, 15];

const PASTEL_SUBJECT_CARDS = [
  {
    concept: 'React Hooks',
    subject: 'Web Development',
    difficulty: 'Intermediate',
    pastel: 'bg-[#FDE8E1] border-[#F7C4B7] hover:border-[#EFA28E]',
    tag: 'Web Dev',
    tagBg: 'bg-[#FAD3C7] text-[#8C3A27]'
  },
  {
    concept: 'JavaScript Closures',
    subject: 'Programming Languages',
    difficulty: 'Intermediate',
    pastel: 'bg-[#FEF3D6] border-[#F9E09B] hover:border-[#F4CD6C]',
    tag: 'Languages',
    tagBg: 'bg-[#FBE8AC] text-[#78570A]'
  },
  {
    concept: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    difficulty: 'Intermediate',
    pastel: 'bg-[#E3ECE1] border-[#C1D7BC] hover:border-[#A2C49C]',
    tag: 'Algorithms',
    tagBg: 'bg-[#D2E2CF] text-[#2F522B]'
  },
  {
    concept: 'DBMS Normalization',
    subject: 'Database Systems',
    difficulty: 'Intermediate',
    pastel: 'bg-[#E0EDF8] border-[#B8D7EF] hover:border-[#96C4E7]',
    tag: 'Databases',
    tagBg: 'bg-[#CBE1F3] text-[#204E74]'
  },
  {
    concept: 'Operating Systems',
    subject: 'Operating Systems',
    difficulty: 'Intermediate',
    pastel: 'bg-[#EAE6F8] border-[#CEC6F0] hover:border-[#B5A9E6]',
    tag: 'Systems',
    tagBg: 'bg-[#DCD5F3] text-[#4A3B83]'
  },
  {
    concept: 'Machine Learning',
    subject: 'Machine Learning & AI',
    difficulty: 'Beginner',
    pastel: 'bg-[#F9E3EB] border-[#EFAEC6] hover:border-[#E58DAE]',
    tag: 'AI & Data',
    tagBg: 'bg-[#F4CBDC] text-[#7A284A]'
  }
];

export default function QuizConfigCard({
  concept,
  setConcept,
  subject,
  setSubject,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  onGenerateQuiz,
  isLoading,
  error,
  healthData,
  adaptiveContext = null,
  onClearAdaptiveContext = null,
  imageNotes = null,
  setImageNotes = null
}) {
  const [useSampleMode, setUseSampleMode] = useState(false);
  const isAiAvailable = healthData?.provider?.isAvailable;
  const hasKey = healthData?.provider?.hasKey;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!concept.trim() && !imageNotes) return;
    onGenerateQuiz({
      useSampleFallback: useSampleMode,
      adaptiveContext,
      imageNotes: imageNotes ? { data: imageNotes.data, mimeType: imageNotes.mimeType } : null
    });
  };

  const handleSelectQuick = (item) => {
    setConcept(item.concept);
    if (item.subject) setSubject(item.subject);
    if (item.difficulty) setDifficulty(item.difficulty);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      alert('Image file must be under 6MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      if (setImageNotes) {
        setImageNotes({
          data: base64,
          mimeType: file.type || 'image/png',
          name: file.name
        });
      }
      if (!concept.trim() || concept === 'React Hooks') {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setConcept(`Notes: ${cleanName}`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="editorial-card rounded-3xl p-6 sm:p-9 bg-white transition-all">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 mb-7 border-b border-[#E6DFD3]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            {!useSampleMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE6F8] border border-[#CEC6F0] text-[#4A3B83] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#574794]" />
                <span>Live AI Mode: {healthData?.provider?.model || 'Gemma 4'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3D6] border border-[#F9E09B] text-[#78570A] text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#8D6912]" />
                <span>Offline Sample Mode</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1A1915] tracking-tight leading-[1.15]">
            A little practice. A lot of progress.
          </h1>
          <p className="text-sm text-[#666259] leading-relaxed">
            {!useSampleMode
              ? `Synthesize custom multiple-choice assessments calibrated by ${healthData?.provider?.model || 'Gemma 4'} with pedagogical explanations.`
              : 'Explore the complete testing and grading environment using curated offline demonstration exams.'}
          </p>
        </div>

        {/* Mode Toggle Segmented Control */}
        <div className="flex items-center gap-1 bg-[#F3EFE6] p-1.5 rounded-2xl border border-[#E6DFD3] self-start flex-shrink-0">
          <button
            type="button"
            onClick={() => setUseSampleMode(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              !useSampleMode
                ? 'bg-[#1A1915] text-[#F8F5EF] shadow-sm'
                : 'text-[#666259] hover:text-[#1A1915]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Live AI</span>
          </button>
          <button
            type="button"
            onClick={() => setUseSampleMode(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              useSampleMode
                ? 'bg-[#8D6912] text-white shadow-sm'
                : 'text-[#666259] hover:text-[#1A1915]'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Sample Demo</span>
          </button>
        </div>
      </div>

      {/* Pastel Subject Cards Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468]">
            Explore Curated Study Subjects
          </span>
          <span className="text-xs text-[#8F897D]">Click any card to load</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PASTEL_SUBJECT_CARDS.map((card) => {
            const isSelected = concept === card.concept;
            return (
              <button
                type="button"
                key={card.concept}
                onClick={() => handleSelectQuick(card)}
                className={`${card.pastel} border rounded-2xl p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer flex flex-col justify-between h-28 relative ${
                  isSelected ? 'ring-2 ring-[#1A1915] shadow-sm' : ''
                }`}
              >
                <div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${card.tagBg}`}>
                    {card.tag}
                  </span>
                  <h4 className="text-xs font-semibold text-[#1A1915] mt-2 line-clamp-2 leading-snug">
                    {card.concept}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#5C584E] pt-1">
                  <span>{card.difficulty}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adaptive Learning Banner if active */}
      {adaptiveContext && (
        <div className="mb-6 p-4 rounded-2xl bg-[#EAE6F8] border border-[#CEC6F0] flex items-center justify-between text-xs text-[#4A3B83] shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#574794] flex-shrink-0" />
            <div>
              <span className="font-bold">Adaptive Remediation Active: </span>
              <span>
                Targeting previous mistakes in{' '}
                <strong className="underline decoration-[#CEC6F0]">{adaptiveContext.weakTopics?.join(', ') || 'weak subtopics'}</strong>
              </span>
            </div>
          </div>
          {onClearAdaptiveContext && (
            <button
              type="button"
              onClick={onClearAdaptiveContext}
              className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white text-[11px] font-semibold border border-[#CEC6F0] transition-colors cursor-pointer"
            >
              Reset to Standard
            </button>
          )}
        </div>
      )}

      {/* Offline Demo Warning Notice if active */}
      {useSampleMode && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FEF3D6] border border-[#F9E09B] text-[#78570A] text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#8D6912] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Curated Offline Demo Active: </strong>
            Questions will load from verified sample quizzes without consuming live API tokens.
          </div>
        </div>
      )}

      {/* Missing API key reminder when in Live AI mode without key */}
      {!useSampleMode && !hasKey && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FDE8E1] border border-[#F7C4B7] text-[#8C3A27] text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#934533] flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Live Key Required: </strong>
              To synthesize quizzes with Gemma, set <code className="bg-white/80 px-1 py-0.5 rounded text-[#1A1915] font-mono">GEMINI_API_KEY</code> in <code className="bg-white/80 px-1 py-0.5 rounded font-mono">.env</code>.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUseSampleMode(true)}
            className="px-3 py-1.5 rounded-xl bg-[#8C3A27] hover:bg-[#722F1F] text-white text-[11px] font-semibold flex-shrink-0 transition-colors cursor-pointer"
          >
            Use Sample Demo
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F9E3EB] border border-[#EFAEC6] text-[#7A284A] text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#8E3259] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Quiz Synthesis Notice</p>
            <p className="text-xs text-[#7A284A]/90 mt-0.5 leading-relaxed">{error}</p>
            {error.includes('GEMINI_API_KEY') && !useSampleMode && (
              <button
                type="button"
                onClick={() => {
                  setUseSampleMode(true);
                  onGenerateQuiz({ useSampleFallback: true });
                }}
                className="mt-2 text-xs font-semibold text-[#8E3259] underline hover:text-[#1A1915]"
              >
                Switch to Curated Demo Quiz & Retry →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Concept Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C584E]">
              Target Concept or Question Topic <span className="text-[#8C3A27]">*</span>
            </label>
            {/* Optional Notes Attachment Trigger */}
            <label className="inline-flex items-center gap-1.5 text-xs text-[#7A7468] hover:text-[#1A1915] cursor-pointer transition-colors">
              <Image className="w-3.5 h-3.5 text-[#5C584E]" />
              <span>{imageNotes ? 'Change Notes Image' : 'Attach Notes / Diagram (Gemma 4 Vision)'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., React Hooks, JavaScript Closures, Binary Search Trees, DBMS Normalization..."
              required
              className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-2xl text-[#1A1915] placeholder-[#9E9789] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent transition-all text-sm font-medium pr-14"
            />
            {concept && (
              <button
                type="button"
                onClick={() => setConcept('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#7A7468] hover:text-[#1A1915] px-2 py-1 rounded-lg hover:bg-[#E6DFD3] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Attached Image Badge if present */}
          {imageNotes && (
            <div className="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-[#E3ECE1] border border-[#C1D7BC] text-xs text-[#2F522B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#396335]" />
                <span className="font-medium truncate max-w-xs">Attached: {imageNotes.name || 'Study Notes Image'}</span>
                <span className="text-[10px] text-[#396335] bg-white/60 px-1.5 py-0.5 rounded">Gemma 4 Multimodal Ready</span>
              </div>
              <button
                type="button"
                onClick={() => setImageNotes && setImageNotes(null)}
                className="text-xs text-[#2F522B] hover:text-[#1A1915] font-semibold underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Two-column selectors: Subject and Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C584E] mb-2">
              Domain / Academic Discipline
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4.5 py-3.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-2xl text-[#1A1915] focus:outline-none focus:ring-2 focus:ring-[#1A1915] focus:border-transparent text-sm font-medium appearance-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub} className="bg-white text-[#1A1915]">
                    {sub}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4.5 top-1/2 -translate-y-1/2 text-[#7A7468] text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Question Count Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C584E] mb-2">
              Session Length
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {QUESTION_COUNTS.map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 px-3 rounded-2xl text-sm font-medium transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    questionCount === count
                      ? 'bg-[#1A1915] text-[#F8F5EF] border-[#1A1915] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#5C584E] border-[#DDD5C7] hover:border-[#1A1915] hover:text-[#1A1915]'
                  }`}
                >
                  <span className="font-semibold">{count}</span>
                  <span className="text-xs opacity-75">Questions</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Level Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C584E] mb-2">
            Depth & Difficulty Calibration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_LEVELS.map((lvl) => {
              const isSelected = difficulty === lvl.id;
              return (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF8F5] border-[#1A1915] ring-2 ring-[#1A1915] shadow-sm'
                      : 'bg-[#FAF8F5] border-[#DDD5C7] hover:border-[#9E9789]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#1A1915] font-serif">{lvl.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1A1915]" />}
                  </div>
                  <p className="text-xs text-[#666259] leading-snug">{lvl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Indicator */}
        <div className="flex items-center justify-between px-4.5 py-3 rounded-2xl bg-[#F3EFE6] border border-[#E6DFD3] text-xs text-[#5C584E]">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1A1915]" />
            <span>Format:</span>
          </span>
          <span className="font-medium text-[#1A1915]">
            4 Distinct Options • Server-Graded Key • Anti-Cheat Encrypted
          </span>
        </div>

        {/* Generate Quiz CTA Button */}
        <button
          type="submit"
          disabled={isLoading || (!concept.trim() && !imageNotes)}
          className={`w-full py-4 px-6 rounded-2xl font-serif text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
            isLoading || (!concept.trim() && !imageNotes)
              ? 'bg-[#E6DFD3] text-[#9E9789] cursor-not-allowed border border-[#DDD5C7]'
              : useSampleMode
              ? 'bg-[#8D6912] hover:bg-[#74560E] text-white shadow-sm hover:shadow'
              : 'bg-[#1A1915] hover:bg-[#2C2923] text-[#F8F5EF] shadow-md hover:shadow-lg'
          }`}
        >
          {useSampleMode ? (
            <BookOpen className="w-5 h-5 text-amber-200" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#E3ECE1]" />
          )}
          <span>
            {isLoading
              ? 'Synthesizing Adaptive Quiz...'
              : useSampleMode
              ? 'Load Curated Offline Demo Quiz'
              : imageNotes
              ? `Synthesize Quiz from Notes (${healthData?.provider?.model || 'Gemma 4'})`
              : adaptiveContext
              ? `Generate Targeted Adaptive Drill (${healthData?.provider?.model || 'Gemma 4'})`
              : `Generate Practice Set (${healthData?.provider?.model || 'Gemma 4'})`}
          </span>
        </button>
      </form>
    </div>
  );
}
