'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiRefresh, HiCheckCircle, HiExclamationCircle, HiLightBulb, HiShieldCheck } from 'react-icons/hi';

export default function ReportPage() {
  const router = useRouter();
  const [r, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('interview_report');
      if (data) {
        try {
          setReport(JSON.parse(data));
        } catch (e) {
          console.error('Error parsing report data:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-white/5 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm font-semibold">Generating Performance Report...</p>
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center glass-card p-8 border-dark-800 max-w-sm">
          <p className="text-dark-400 mb-4 font-bold">No mock interview records found.</p>
          <button 
            onClick={() => router.push('/')} 
            type="button"
            className="btn-gov-primary px-6 py-2.5 cursor-pointer text-xs uppercase tracking-wider"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-governance flex text-dark-100">
      {/* Sidebar - Quick Nav */}
      <div className="w-72 border-r border-dark-800 bg-dark-950/40 hidden lg:flex flex-col p-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/[0.02] blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
             <HiCheckCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white uppercase bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
            Report Cards
          </span>
        </div>

        <nav className="space-y-2 flex-1 relative z-10">
          <div className="px-4 py-3.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-xs font-black uppercase tracking-wider">
             Performance Summary
          </div>
          <button 
            onClick={() => router.push('/')} 
            type="button"
            className="w-full px-4 py-3.5 rounded-xl text-dark-500 flex items-center gap-3 text-xs font-black uppercase tracking-wider hover:text-dark-300 hover:bg-dark-900/30 transition-all text-left cursor-pointer"
          >
             New Practice Session
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-dark-800/80 relative z-10">
          <p className="text-[9px] font-black text-dark-600 uppercase tracking-widest mb-1.5">Practice Portal</p>
          <p className="text-xs font-bold text-dark-400">Gemini Interview Prep v3.5</p>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-600/[0.01] blur-[150px] rounded-full pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-b-dark-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <HiCheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tighter">Performance Report</span>
           </div>
           <div className="status-success py-1 px-2.5 text-[9px] font-bold">Done</div>
        </div>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
          <div>
            <span className="status-success mb-3 text-[9px] font-black tracking-widest">Mock Interview Completed</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Performance Report Card
            </h1>
            <p className="text-dark-400 text-sm font-medium">{r.topic} • Job Interview Preparation Review</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            type="button"
            className="btn-gov-secondary text-xs flex items-center gap-2 self-start cursor-pointer active:scale-95 shadow-sm"
          >
            <HiRefresh className="w-4 h-4" /> Restart Session
          </button>
        </header>

        <div className="space-y-8 max-w-6xl relative z-10">
          {/* Top Analytics Cards */}
          <div className="glass-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-dark-800/80 shadow-2xl">
            {/* Grade Card */}
            <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center">
              <span className="block text-[9px] font-black text-dark-500 uppercase tracking-widest mb-4">Interview Grade</span>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-3xl font-black text-white shadow-lg shadow-emerald-500/10 animate-pulse">
                {r.overallGrade}
              </div>
            </div>

            {/* Overall Score */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <span className="block text-[9px] font-black text-dark-500 uppercase tracking-widest mb-4">Overall Score</span>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-dark-950"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-emerald-500 transition-all duration-1000"
                    strokeWidth="4"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * r.score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-white">{r.score}%</span>
                </div>
              </div>
            </div>

            {/* Topic Accuracy */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <span className="block text-[9px] font-black text-dark-500 uppercase tracking-widest mb-4">Topic Accuracy</span>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-dark-950"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-teal-400 transition-all duration-1000"
                    strokeWidth="4"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * r.accuracy) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-teal-400">{r.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Communication Clarity */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <span className="block text-[9px] font-black text-dark-500 uppercase tracking-widest mb-4">Communication Clarity</span>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-dark-950"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    className="text-primary-400 transition-all duration-1000"
                    strokeWidth="4"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * r.confidenceLevel) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-primary-400">{r.confidenceLevel}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Strengths/Gaps */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass-card p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <HiShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-dark-400">AI Performance Evaluation</h3>
              </div>
              
              <p className="text-dark-200 text-sm sm:text-base leading-relaxed italic font-semibold border-l-2 border-dark-700 pl-4 mb-8">
                "{r.overallFeedback}"
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-dark-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiCheckCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Key Strengths</h4>
                  </div>
                  <ul className="space-y-3">
                    {r.strengths?.map((s, i) => (
                      <li key={i} className="text-xs text-dark-300 flex items-start gap-2.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <HiExclamationCircle className="w-4 h-4 text-rose-400" />
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Areas of Improvement</h4>
                  </div>
                  <ul className="space-y-3">
                    {r.weaknesses?.map((w, i) => (
                      <li key={i} className="text-xs text-dark-300 flex items-start gap-2.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Growth Protocol */}
            <div className="glass-card p-6 sm:p-8 bg-primary-600/[0.01] border-primary-500/10">
              <div className="flex items-center gap-2 mb-6">
                <HiLightBulb className="w-5 h-5 text-primary-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-primary-400">Study Recommendations</h3>
              </div>
              <div className="space-y-3">
                {r.suggestions?.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-950/40 border border-dark-800/80 text-xs text-dark-300 leading-relaxed font-bold">
                    <span className="text-primary-500 font-extrabold mr-1.5 text-[10px] tracking-wider uppercase">RECOMMENDED:</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Response Log Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <HiShieldCheck className="w-5 h-5 text-dark-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-dark-400">Question & Answer Feedback Log</h3>
            </div>
            
            <div className="glass-card overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-dark-950/80 border-b border-dark-800/80">
                    <tr>
                      <th className="px-6 py-4.5 text-[9px] font-black text-dark-500 uppercase tracking-widest">Question & Answer Responses</th>
                      <th className="px-6 py-4.5 text-[9px] font-black text-dark-500 uppercase tracking-widest w-28 text-center">Status</th>
                      <th className="px-6 py-4.5 text-[9px] font-black text-dark-500 uppercase tracking-widest w-24 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800/50">
                    {r.questions?.map((qa, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-dark-900/20 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-white mb-1.5">Round 0{i + 1}: {qa.question}</p>
                            <p className="text-xs text-dark-400 line-clamp-2 italic font-semibold pl-3 border-l border-dark-800">
                              "{qa.answer || 'No response recorded.'}"
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`status-chip text-[9px] ${qa.isCorrect ? 'status-success' : 'status-danger'}`}>
                              {qa.isCorrect ? 'Correct' : 'Needs Review'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-xs font-black text-white">{qa.score}<span className="text-[9px] text-dark-600 ml-0.5">/10</span></span>
                          </td>
                        </tr>
                        <tr className="bg-dark-950/20">
                          <td colSpan="3" className="px-6 py-4 border-b border-dark-800/60">
                            <div className="flex items-start gap-2.5 pl-3">
                               <span className="text-[9px] font-black text-primary-500 uppercase mt-0.5 shrink-0 tracking-wider">Analysis:</span>
                               <p className="text-xs text-dark-400 leading-relaxed font-semibold">{qa.feedback}</p>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 pb-16">
            <button 
              onClick={() => router.push('/')} 
              type="button"
              className="btn-gov-primary px-12 py-4 cursor-pointer text-xs uppercase tracking-widest"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
