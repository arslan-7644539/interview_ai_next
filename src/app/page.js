'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiMicrophone, HiArrowRight, HiCog, HiDatabase, HiCollection, HiLightningBolt } from 'react-icons/hi';

const topics = [
  { label: 'Software Engineer', icon: '💻', desc: 'Coding, system design, DSA, web technologies, and database architecture.' },
  { label: 'Teaching & Pedagogy', icon: '🏫', desc: 'Classroom management, learning theories, curriculum design, and student engagement.' },
  { label: 'Medical (Doctor)', icon: '🩺', desc: 'Clinical diagnostics, patient care ethics, anatomy, and general medical knowledge.' },
  { label: 'Military (Army)', icon: '🎖️', desc: 'Leadership under pressure, situational tactics, physical endurance, and discipline.' },
  { label: 'Civil Service (CSS Exam)', icon: '⚖️', desc: 'Public administration, governance, international relations, ethics, and essay structure.' },
  { label: 'HR & Behavioral', icon: '🤝', desc: 'STAR method behavioral questions, situational leadership, empathy, and workplace ethics.' },
];

export default function LandingPage() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const router = useRouter();

  const start = () => {
    if (!topic.trim()) return;
    router.push(`/interview?topic=${encodeURIComponent(topic.trim())}&questions=${questions}&difficulty=${difficulty}`);
  };

  return (
    <div className="min-h-screen bg-governance flex text-dark-100">
      {/* Student Sidebar (Desktop Only) */}
      <div className="w-72 border-r border-dark-800 bg-dark-950/40 hidden lg:flex flex-col p-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/[0.02] blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-900/30">
            <HiMicrophone className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white uppercase bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
            Prep Portal
          </span>
        </div>

        <nav className="space-y-2 flex-1 relative z-10">
          <div className="px-4 py-3.5 rounded-xl bg-primary-600/10 border border-primary-500/20 text-primary-400 flex items-center gap-3 text-xs font-black uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-md shadow-primary-500/50 animate-pulse" />
            Mock Interview
          </div>
          <div className="px-4 py-3.5 rounded-xl text-dark-500 flex items-center gap-3 text-xs font-black uppercase tracking-wider hover:text-dark-300 hover:bg-dark-900/30 transition-all cursor-pointer">
            <HiDatabase className="w-4 h-4" /> Past Interviews
          </div>
          <div className="px-4 py-3.5 rounded-xl text-dark-500 flex items-center gap-3 text-xs font-black uppercase tracking-wider hover:text-dark-300 hover:bg-dark-900/30 transition-all cursor-pointer">
            <HiCog className="w-4 h-4" /> Prep Settings
          </div>
        </nav>

        <div className="mt-auto pt-8 border-t border-dark-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-dark-500">Practice Engine Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/[0.01] blur-[150px] rounded-full pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-6 border-b border-dark-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <HiMicrophone className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tighter">Prep Portal</span>
           </div>
           <div className="status-active py-1 px-2.5 text-[9px]">Live</div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight tracking-tight">
              Mock Interview Hub
            </h1>
            <p className="text-dark-400 text-sm font-medium">Practice speaking naturally and prepare to ace your upcoming job interview.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-dark-900/80 backdrop-blur-md border border-dark-800/80 rounded-xl px-4 py-2.5 text-right flex-1 sm:flex-initial shadow-md">
              <span className="block text-[9px] font-black text-dark-500 uppercase tracking-wider mb-0.5">AI Interviewer</span>
              <span className="text-xs font-bold text-white whitespace-nowrap">Gemini Active</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl relative z-10">
          {/* Main Configuration Layout */}
          <div className="xl:col-span-2 space-y-8">
            {/* Step 1: Topic Selection Card */}
            <section className="glass-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black uppercase tracking-wider text-dark-400">1. Select Job Topic / Tech Stack</h2>
                {topic && (
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                    Selected
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((t) => {
                  const isSelected = topic === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTopic(t.label)}
                      className={`glass-card p-5 text-left transition-all duration-300 relative group cursor-pointer hover:-translate-y-1 active:scale-98 overflow-hidden ${
                        isSelected
                          ? 'border-primary-500 bg-primary-950/40 shadow-xl shadow-primary-500/10 scale-[1.01] ring-1 ring-primary-500/30'
                          : 'hover:border-dark-600 hover:bg-dark-900/60 border-dark-800/80'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/[0.04] to-indigo-500/[0.04] pointer-events-none animate-pulse-slow" />
                      )}
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                          {t.icon}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[10px] text-white font-bold animate-fade-in shadow-md shadow-primary-500/20">
                            ✓
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-black text-white group-hover:text-primary-400 transition-colors duration-300 mb-1 relative z-10">
                        {t.label}
                      </h3>
                      <p className="text-[10px] text-dark-500 font-medium leading-normal line-clamp-2 relative z-10">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Configuration Parameters Card */}
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-xs font-black uppercase tracking-wider text-dark-400 mb-6">2. Interview Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dark-500 mb-3">Question Count</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { val: 3, label: '03', sub: 'Quick Practice' },
                      { val: 5, label: '05', sub: 'Standard Round' },
                      { val: 8, label: '08', sub: 'Thorough Practice' },
                      { val: 10, label: '10', sub: 'Full Interview' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setQuestions(opt.val)}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          questions === opt.val
                            ? 'border-primary-500 bg-primary-600/10 text-white font-bold ring-1 ring-primary-500/20'
                            : 'border-dark-800 bg-dark-950/40 text-dark-400 hover:border-dark-700 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm font-black">{opt.label}</span>
                        <span className="block text-[8px] uppercase tracking-wider text-dark-500 font-semibold mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-dark-500 mb-3">Target Career Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'easy', label: 'Entry Level / Junior', sub: 'Foundations' },
                      { val: 'medium', label: 'Associate / Mid-Level', sub: 'Applied Scenarios' },
                      { val: 'hard', label: 'Lead / Senior', sub: 'Advanced Edge-Cases' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setDifficulty(opt.val)}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          difficulty === opt.val
                            ? 'border-primary-500 bg-primary-600/10 text-white font-bold ring-1 ring-primary-500/20'
                            : 'border-dark-800 bg-dark-950/40 text-dark-400 hover:border-dark-700 hover:text-white'
                        }`}
                      >
                        <span className="block text-sm font-black">{opt.label}</span>
                        <span className="block text-[8px] uppercase tracking-wider text-dark-500 font-semibold mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 bg-primary-600/[0.02] border-primary-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/[0.04] blur-3xl rounded-full pointer-events-none" />
              
              <h3 className="text-[10px] font-black uppercase tracking-wider text-primary-400 mb-5 relative z-10">
                Mock Interview Setup
              </h3>
              
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-dark-800/50">
                  <span className="text-dark-500 font-bold uppercase tracking-wider text-[9px]">Target Topic</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[11px] ${topic ? 'text-white bg-dark-800 border border-dark-700' : 'text-dark-600'}`}>
                    {topic || 'None Selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-dark-800/50">
                  <span className="text-dark-500 font-bold uppercase tracking-wider text-[9px]">Questions</span>
                  <span className="text-white font-black">{questions} Questions</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-dark-800/50">
                  <span className="text-dark-500 font-bold uppercase tracking-wider text-[9px]">Career Level</span>
                  <span className="text-primary-400 font-black uppercase text-[10px] tracking-wider">
                    {difficulty === 'easy' ? 'Entry Level' : difficulty === 'medium' ? 'Mid-Level' : 'Senior'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-dark-500 font-bold uppercase tracking-wider text-[9px]">Mock Method</span>
                  <span className="text-white font-bold">Voice Speech & Evaluation</span>
                </div>
              </div>

              <button
                onClick={start}
                disabled={!topic}
                className="btn-gov-primary w-full py-4 flex items-center justify-center gap-2 group cursor-pointer relative z-10"
              >
                Start Practice Session 
                <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="glass-card p-6 border-dashed border-dark-800 bg-dark-950/20 text-center">
              <p className="text-[9px] text-dark-500 leading-relaxed font-bold uppercase tracking-wider">
                💡 Student Portal: Speak your answers naturally and get real-time feedback with recommendations to crack your next interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
