'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiMicrophone, HiStop, HiArrowRight, HiCheck, HiVolumeUp, HiSparkles, HiDatabase, HiTrendingUp } from 'react-icons/hi';
import ThemeToggle from '@/components/ThemeToggle';

const API = '/api';

function VoiceInterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topic = searchParams.get('topic') || '';
  const numberOfQuestions = Number(searchParams.get('questions')) || 5;
  const difficulty = searchParams.get('difficulty') || 'medium';

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading | active | finishing
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);

  const recRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (!topic) {
      router.push('/');
      return;
    }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) setVoiceOk(false);
    loadQuestions();
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      recRef.current?.stop();
    };
  }, [topic]);

  // ---- Load Questions ----
  const loadQuestions = async () => {
    try {
      const { data } = await axios.post(`${API}/interview/generate`, { topic, numberOfQuestions, difficulty });
      const qs = data.data.questions;
      setQuestions(qs);
      setPhase('active');
      setTimeout(() => speak(`Let's begin. Question 1. ${qs[0]?.question}`), 400);
    } catch {
      toast.error('Failed to load questions');
      router.push('/');
    }
  };

  // ---- TTS ----
  const speak = useCallback((text) => {
    return new Promise(resolve => {
      if (!synthRef.current) return resolve();
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92; u.pitch = 1.05;
      const voices = synthRef.current.getVoices();
      const v = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'));
      if (v) u.voice = v;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => { setIsSpeaking(false); resolve(); };
      u.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current.speak(u);
    });
  }, []);

  // ---- STT ----
  const toggleMic = useCallback(() => {
    if (isRecording) {
      recRef.current?.stop();
      recRef.current = null;
      setIsRecording(false);
      return;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);

    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';

    const qId = questions[idx]?.id;
    let final = answers[qId] || '';

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += ' ' + e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      setAnswers(p => ({ ...p, [qId]: (final + ' ' + interim).trim() }));
    };

    rec.onerror = (e) => {
      if (e.error !== 'aborted') toast.error('Mic error');
      setIsRecording(false);
    };
    rec.onend = () => setIsRecording(false);

    rec.start();
    recRef.current = rec;
    setIsRecording(true);
  }, [isRecording, questions, idx, answers]);

  // ---- Submit ----
  const submit = async () => {
    const q = questions[idx];
    const ans = answers[q?.id] || '';
    if (!ans.trim()) { toast.error('Speak or type your answer first'); return; }

    recRef.current?.stop(); setIsRecording(false);
    setSubmitting(true); setFeedback(null);

    try {
      const { data } = await axios.post(`${API}/interview/evaluate`, {
        question: q.question, answer: ans, expectedKeyPoints: q.expectedKeyPoints || [], topic,
      });
      const ev = data.data;
      setFeedback(ev);
      setResults(p => [...p.filter(r => r.questionId !== q.id), {
        questionId: q.id, question: q.question, answer: ans,
        score: ev.score, maxScore: ev.maxScore, feedback: ev.feedback, isCorrect: ev.isCorrect,
      }]);
      await speak(ev.feedback);
    } catch {
      toast.error('Evaluation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Navigate ----
  const goTo = (i) => {
    recRef.current?.stop(); setIsRecording(false);
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setFeedback(null); setIdx(i);
    setTimeout(() => speak(`Question ${i+1}. ${questions[i]?.question}`), 200);
  };

  const finish = async () => {
    recRef.current?.stop();
    if (synthRef.current) synthRef.current.cancel();
    setPhase('finishing');
    try {
      const finalResults = questions.map(q => {
        const r = results.find(r => r.questionId === q.id);
        return r || { questionId: q.id, question: q.question, answer: answers[q.id] || '', score: 0, maxScore: 10, feedback: 'Not answered.', isCorrect: false };
      });
      const { data } = await axios.post(`${API}/interview/report`, { topic, results: finalResults });
      sessionStorage.setItem('interview_report', JSON.stringify(data.data));
      router.push('/report');
    } catch {
      toast.error('Report generation failed');
      setPhase('active');
    }
  };

  // ---- Loading View ----
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-governance flex flex-col items-center justify-center p-6 relative overflow-hidden text-dark-100">
        {/* Futuristic glowing backdrops */}
        <div className="absolute inset-0 bg-primary-600/[0.03] blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/[0.02] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-md w-full glass-card p-10 border border-dark-800/80 shadow-2xl">
          {/* Animated floating icon */}
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 animate-bounce-slow shadow-xl shadow-primary-500/20">
            <HiMicrophone className="w-10 h-10 text-always-white" />
          </div>
          
          <h2 className="text-2xl font-black text-dark-100 mb-2 tracking-tight">Preparing Mock Questions</h2>
          <p className="text-dark-400 text-sm mb-6">Creating mock interview questions tailored to your field...</p>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded border border-primary-500/25">
              {topic}
            </span>
            <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest bg-dark-800/80 px-3 py-1 rounded border border-dark-700/60">
              {difficulty === 'easy' ? 'Entry Level' : difficulty === 'medium' ? 'Mid-Level' : 'Senior'}
            </span>
          </div>

          <div className="flex gap-1.5 justify-center items-center">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className="w-2 h-2 rounded-full bg-primary-500" 
                style={{
                  animation: 'bounce 1s infinite alternate',
                  animationDelay: `${i * 0.15}s`
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Finishing View ----
  if (phase === 'finishing') {
    return (
      <div className="min-h-screen bg-governance flex flex-col items-center justify-center p-6 relative overflow-hidden text-dark-100">
        <div className="absolute inset-0 bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
        
        <div className="relative z-10 text-center max-w-md w-full glass-card p-10 border border-dark-800/80 shadow-2xl">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <HiSparkles className="w-8 h-8 text-primary-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-dark-100 mb-2 tracking-tight animate-pulse">Analyzing Performance</h2>
          <p className="text-dark-500 text-xs font-black uppercase tracking-widest">Generating Interview Report Card...</p>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const totalQ = questions.length;
  const currentAns = answers[q?.id] || '';

  return (
    <div className="min-h-screen bg-governance flex text-dark-100">
      {/* Sidebar - Contextual Info */}
      <div className="w-72 border-r border-dark-800 bg-dark-950/40 hidden xl:flex flex-col p-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/[0.01] blur-3xl rounded-full pointer-events-none" />
        
        <div className="mb-10 relative z-10">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-dark-500 mb-4">Mock Parameters</h3>
          <div className="space-y-3">
            <div className="glass-card p-4 border-dark-800 bg-dark-900/40">
              <span className="block text-[8px] font-black text-dark-500 uppercase tracking-widest mb-1">Target Topic</span>
              <span className="text-xs font-bold text-dark-100">{topic}</span>
            </div>
            <div className="glass-card p-4 border-dark-800 bg-dark-900/40">
              <span className="block text-[8px] font-black text-dark-500 uppercase tracking-widest mb-1">Career Level</span>
              <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                {difficulty === 'easy' ? 'Entry Level' : difficulty === 'medium' ? 'Mid-Level' : 'Senior'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-10 relative z-10">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-dark-500 mb-4">Interview Rounds</h3>
          <div className="space-y-2">
            {questions.map((_, i) => {
              const isActive = i === idx;
              const isAnswered = results.some(r => r.questionId === questions[i]?.id);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    isActive 
                      ? 'bg-primary-600/15 border border-primary-500/20 text-primary-400 font-extrabold shadow-sm' 
                      : 'text-dark-500 border border-transparent hover:text-dark-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    isActive 
                      ? 'bg-primary-500 shadow-md shadow-primary-500/50' 
                      : isAnswered 
                        ? 'bg-emerald-500' 
                        : 'bg-dark-800'
                  }`} />
                  Round 0{i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-dark-800/80 relative z-10 flex items-center justify-between gap-4">
          <div className="status-active py-1 px-2.5 text-[9px] font-black tracking-widest">
             AI Active
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Assessment Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/[0.01] blur-[150px] rounded-full pointer-events-none" />
        
        {/* Mobile Mini Header */}
        <div className="xl:hidden flex items-center justify-between mb-8 pb-4 border-b border-dark-800">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">{topic}</span>
              <span className="text-sm font-black text-dark-100">Round 0{idx + 1} of 0{totalQ}</span>
           </div>
           <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="status-active py-1 px-2 text-[9px]">Active Practice</div>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          {/* Header (Desktop Only) */}
          <div className="hidden xl:flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-900 to-dark-950 border border-dark-800 flex items-center justify-center text-dark-100 text-xs font-black shadow-md">
                0{idx + 1}
              </div>
              <h2 className="text-md font-black text-dark-100 uppercase tracking-wider">Practice Session</h2>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <div className="text-right">
                <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1.5">Interview Progress</div>
                <div className="w-48 h-1.5 bg-dark-900 border border-dark-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-700" style={{ width: `${((idx + 1) / totalQ) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-card p-6 sm:p-10 mb-8 border-dark-800/80 relative shadow-2xl">
            {/* Interviewer Avatar Speaking/Listening Indicator */}
            <div className="flex flex-col items-center justify-center mb-8 border-b border-dark-800/40 pb-6">
              <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                {/* Pulsing glow outer ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                  isSpeaking 
                    ? 'bg-primary-500/10 scale-125 border border-primary-500/30 animate-pulse' 
                    : isRecording 
                      ? 'bg-red-500/10 scale-125 border border-red-500/30 animate-pulse'
                      : 'bg-dark-800 scale-100 border border-dark-700'
                }`} />
                
                {/* Rotating dash borders */}
                <div className={`absolute inset-1.5 rounded-full border border-dashed transition-all duration-1000 ${
                  isSpeaking 
                    ? 'border-primary-500/60 animate-spin' 
                    : isRecording 
                      ? 'border-red-500/60 animate-spin-slow'
                      : 'border-dark-600'
                }`} style={{ animationDuration: isSpeaking ? '8s' : '15s' }} />

                {/* Inner core circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-lg ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-primary-500/20'
                    : isRecording
                      ? 'bg-gradient-to-tr from-red-500 to-rose-600 shadow-red-500/20'
                      : 'bg-dark-950 border border-dark-800 text-dark-500'
                }`}>
                  {isSpeaking ? (
                    <HiVolumeUp className="w-5 h-5 text-white animate-bounce" />
                  ) : isRecording ? (
                    <HiMicrophone className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <HiSparkles className="w-5 h-5 text-dark-500" />
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                isSpeaking 
                  ? 'text-primary-400 font-extrabold' 
                  : isRecording 
                    ? 'text-red-500 font-extrabold' 
                    : 'text-dark-500'
              }`}>
                {isSpeaking ? 'AI Interviewer Speaking' : isRecording ? 'Interviewer Listening...' : 'Interviewer Active'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 sm:mb-10">
              <div className="flex-1">
                <span className="status-active mb-3.5 text-[9px] font-black tracking-widest">Interviewer Question</span>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-dark-100 leading-relaxed">
                  {q?.question}
                </h1>
              </div>
              <button 
                onClick={() => speak(`${q?.question}`)} 
                type="button"
                className="p-3.5 rounded-xl bg-dark-800 border border-dark-700/50 hover:bg-dark-700/80 hover:border-dark-600 text-dark-300 hover:text-dark-100 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Speak Question"
              >
                <HiVolumeUp className="w-5 h-5" />
              </button>
            </div>

            {/* Response Form Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
              {/* Voice Interaction Circle */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-6 border-r border-dark-800/40 relative">
                <div className="relative mb-5">
                  {isRecording && (
                    <div className="absolute -inset-4 bg-red-600/20 rounded-full animate-ping pointer-events-none" />
                  )}
                  <button 
                    onClick={toggleMic} 
                    disabled={!voiceOk}
                    type="button"
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer relative z-10 ${
                      isRecording 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 border-red-500 text-always-white animate-glow-pulse-red shadow-lg shadow-red-500/20 scale-[1.03]' 
                        : 'bg-dark-950/60 border-dark-800 text-dark-400 hover:text-dark-100 hover:border-dark-600 hover:bg-dark-900'
                    }`}
                  >
                    {isRecording ? <HiStop className="w-6 h-6 animate-pulse" /> : <HiMicrophone className="w-6 h-6" />}
                  </button>
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse font-extrabold' : 'text-dark-500'}`}>
                  {isRecording ? 'Listening' : 'Speak Answer'}
                </span>

                {/* Animated Audio Wave bars */}
                {isRecording && (
                  <div className="flex items-center gap-0.5 mt-3 h-4">
                    {[1, 2, 3, 4, 5].map(bar => (
                      <div 
                        key={bar} 
                        className="w-0.5 bg-red-500/80 rounded-full" 
                        style={{
                          height: `${8 + Math.sin(bar) * 6}px`,
                          animation: 'waveBar 0.8s ease-in-out infinite alternate',
                          animationDelay: `${bar * 0.12}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Transcription Area */}
              <div className="lg:col-span-4">
                <div className="bg-dark-950/30 border border-dark-800/80 rounded-xl p-5 h-44 focus-within:border-primary-500/40 focus-within:bg-dark-950/50 transition-all duration-300">
                   <textarea
                    value={currentAns}
                    onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-dark-100 placeholder-dark-600 resize-none text-xs font-semibold leading-relaxed outline-none"
                    placeholder="Your spoken response will be transcribed here. Click the mic to speak or type your answer directly..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Response Trigger */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 border-t border-dark-800/85">
               <p className="text-[8px] text-dark-500 font-bold uppercase tracking-wider">
                 AI Student Portal: Mock Interview Practice System
               </p>
               <button 
                onClick={submit} 
                disabled={submitting || !currentAns.trim()}
                type="button"
                className="btn-gov-primary px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span> 
                    <HiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* holographic AI Feedback */}
          {feedback && (
            <div className={`glass-card p-6 sm:p-8 border-l-4 animate-fade-in mb-8 ${
              feedback.isCorrect 
                ? 'border-l-emerald-500 bg-emerald-600/[0.02]' 
                : 'border-l-rose-500 bg-rose-600/[0.02]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`status-chip text-[9px] font-black ${
                    feedback.isCorrect ? 'status-success' : 'status-danger'
                  }`}>
                    Answer Evaluation
                  </span>
                  <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">
                    Clarity Score: {feedback.score * 10}%
                  </span>
                </div>
                
                <div className="text-lg font-black text-dark-100">
                  {feedback.score}
                  <span className="text-[10px] text-dark-600 ml-1">/10</span>
                </div>
              </div>
              
              <p className="text-dark-200 text-xs font-semibold leading-relaxed italic">
                "{feedback.feedback}"
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {questions.map((_, i) => {
                const isActive = i === idx;
                const isAnswered = results.some(r => r.questionId === questions[i]?.id);
                return (
                  <button 
                    key={i} 
                    onClick={() => goTo(i)}
                    type="button"
                    className={`w-6 h-1 rounded-full transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-primary-500 w-8 shadow-md' 
                        : isAnswered 
                          ? 'bg-emerald-500' 
                          : 'bg-dark-800'
                    }`} 
                  />
                );
              })}
            </div>
            
            {idx < totalQ - 1 ? (
              <button 
                onClick={() => goTo(idx + 1)} 
                type="button"
                className="btn-gov-secondary text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Next Question</span> 
                <HiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={finish} 
                type="button"
                className="btn-gov-primary bg-emerald-600 hover:bg-emerald-500 border-none text-xs px-8 py-2.5 cursor-pointer active:scale-95 shadow-md shadow-emerald-950/20"
              >
                Generate Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VoiceInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-governance flex flex-col items-center justify-center p-6 text-center text-dark-100">
        <div className="w-12 h-12 border-4 border-white/5 border-t-primary-500 rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-black text-dark-100 tracking-tight">Loading Mock Session...</h2>
      </div>
    }>
      <VoiceInterviewPageContent />
    </Suspense>
  );
}
