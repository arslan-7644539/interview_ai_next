'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiMicrophone, HiStop, HiArrowRight, HiCheck, HiVolumeUp, HiSparkles, HiDatabase, HiTrendingUp } from 'react-icons/hi';
import ThemeToggle from '@/components/ThemeToggle';
import { normalizeTranscript } from '@/services/speechNormalizer';

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
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'

  const recRef = useRef(null);
  const synthRef = useRef(null);

  const handleInputModeChange = (mode) => {
    if (isRecording) {
      intentionalStopRef.current = true;
      recRef.current?.stop();
      recRef.current = null;
      setIsRecording(false);

      finalizedTextRef.current = (finalizedTextRef.current + ' ' + sessionFinalsRef.current).replace(/\s+/g, ' ').trim();
      sessionFinalsRef.current = '';

      if (sessionConfidencesRef.current.length > 0) {
        const qId = activeQIdRef.current;
        questionConfidencesRef.current[qId] = [
          ...(questionConfidencesRef.current[qId] || []),
          ...sessionConfidencesRef.current
        ];
        sessionConfidencesRef.current = [];
      }

      const currentQId = activeQIdRef.current;
      setAnswers(p => ({ ...p, [currentQId]: finalizedTextRef.current }));
    }
    setInputMode(mode);
  };

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
      intentionalStopRef.current = true;
      if (synthRef.current) synthRef.current.cancel();
      recRef.current?.stop();
      recRef.current = null;
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

  // ---- STT (Enhanced Voice Recognition) ----
  // Ref to accumulate finalized text across auto-restarts (avoids stale closure issues)
  const finalizedTextRef = useRef('');
  const intentionalStopRef = useRef(false);
  const activeQIdRef = useRef(null);
  const sessionFinalsRef = useRef('');
  const sessionConfidencesRef = useRef([]);
  const questionConfidencesRef = useRef({}); // { [qId]: [confidences] }

  const toggleMic = useCallback(() => {
    if (isRecording) {
      // User intentionally stops — don't auto-restart
      intentionalStopRef.current = true;
      recRef.current?.stop();
      recRef.current = null;
      setIsRecording(false);

      // Accumulate final session text and confidences
      finalizedTextRef.current = (finalizedTextRef.current + ' ' + sessionFinalsRef.current).replace(/\s+/g, ' ').trim();
      sessionFinalsRef.current = '';

      if (sessionConfidencesRef.current.length > 0) {
        const qId = activeQIdRef.current;
        questionConfidencesRef.current[qId] = [
          ...(questionConfidencesRef.current[qId] || []),
          ...sessionConfidencesRef.current
        ];
        sessionConfidencesRef.current = [];
      }

      const currentQId = activeQIdRef.current;
      setAnswers(p => ({ ...p, [currentQId]: finalizedTextRef.current }));
      return;
    }

    // Cancel any ongoing TTS so it doesn't interfere
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);

    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;

    const qId = questions[idx]?.id;
    activeQIdRef.current = qId;
    // Seed the accumulator with any existing answer text
    finalizedTextRef.current = answers[qId] || '';
    intentionalStopRef.current = false;
    sessionFinalsRef.current = '';
    sessionConfidencesRef.current = [];

    const createRecognition = () => {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;         // Let engine propose multiple hypotheses
      rec.lang = 'en-US';             // Well-supported, high-accuracy model

      rec.onresult = (e) => {
        let sessionFinals = '';
        let currentInterim = '';
        const currentConfidences = [];

        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            // Pick the highest-confidence alternative
            let bestTranscript = e.results[i][0].transcript;
            let bestConfidence = e.results[i][0].confidence;

            for (let alt = 1; alt < e.results[i].length; alt++) {
              if (e.results[i][alt].confidence > bestConfidence) {
                bestConfidence = e.results[i][alt].confidence;
                bestTranscript = e.results[i][alt].transcript;
              }
            }

            // Only accept results above a minimum confidence threshold
            if (bestConfidence >= 0.4 || bestConfidence === 0) {
              // confidence === 0 means the browser doesn't report confidence (Firefox)
              sessionFinals += ' ' + bestTranscript;
              if (bestConfidence > 0) {
                currentConfidences.push(bestConfidence);
              }
            }
          } else {
            // For interim, just use the top result for live preview
            currentInterim += ' ' + e.results[i][0].transcript;
          }
        }

        // Store this session's finalized segment text and confidences
        sessionFinalsRef.current = normalizeTranscript(sessionFinals);
        sessionConfidencesRef.current = currentConfidences;

        // Build display text: finalized (prior sessions) + sessionFinals (this session) + current interim preview
        const cleanInterim = normalizeTranscript(currentInterim);
        const displayText = (finalizedTextRef.current + ' ' + sessionFinalsRef.current + ' ' + cleanInterim)
          .replace(/\s+/g, ' ')
          .trim();

        const currentQId = activeQIdRef.current;
        setAnswers(p => ({ ...p, [currentQId]: displayText }));
      };

      rec.onerror = (e) => {
        // 'no-speech' and 'aborted' are normal — don't alarm the user
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        // 'network' errors can happen on spotty connections
        if (e.error === 'network') {
          toast.error('Voice recognition needs an internet connection');
        } else if (e.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow mic access.');
        } else {
          toast.error(`Mic error: ${e.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        // Append sessionFinals and confidences to finalized stores
        finalizedTextRef.current = (finalizedTextRef.current + ' ' + sessionFinalsRef.current).replace(/\s+/g, ' ').trim();
        sessionFinalsRef.current = '';

        if (sessionConfidencesRef.current.length > 0) {
          const currentQId = activeQIdRef.current;
          questionConfidencesRef.current[currentQId] = [
            ...(questionConfidencesRef.current[currentQId] || []),
            ...sessionConfidencesRef.current
          ];
          sessionConfidencesRef.current = [];
        }

        // Auto-restart if the user didn't intentionally stop
        // (Browser cuts off after silence or max duration)
        if (!intentionalStopRef.current && recRef.current) {
          try {
            // Strip interim text — only keep finalized before restart
            const currentQId = activeQIdRef.current;
            setAnswers(p => ({ ...p, [currentQId]: finalizedTextRef.current }));

            const newRec = createRecognition();
            newRec.start();
            recRef.current = newRec;
          } catch {
            // If restart fails, stop gracefully
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      return rec;
    };

    try {
      const rec = createRecognition();
      rec.start();
      recRef.current = rec;
      setIsRecording(true);
    } catch {
      toast.error('Could not start voice recognition');
    }
  }, [isRecording, questions, idx, answers]);

  // ---- Submit ----
  const submit = async () => {
    const q = questions[idx];
    const ans = answers[q?.id] || '';
    if (!ans.trim()) { toast.error('Speak or type your answer first'); return; }

    intentionalStopRef.current = true;
    recRef.current?.stop(); recRef.current = null; setIsRecording(false);

    // Force finalize any remaining session texts/confidences
    finalizedTextRef.current = (finalizedTextRef.current + ' ' + sessionFinalsRef.current).replace(/\s+/g, ' ').trim();
    sessionFinalsRef.current = '';

    if (sessionConfidencesRef.current.length > 0) {
      questionConfidencesRef.current[q.id] = [
        ...(questionConfidencesRef.current[q.id] || []),
        ...sessionConfidencesRef.current
      ];
      sessionConfidencesRef.current = [];
    }

    const finalAns = finalizedTextRef.current || ans;
    setSubmitting(true); setFeedback(null);

    // Calculate speech confidence score for this question
    const qConfList = questionConfidencesRef.current[q.id] || [];
    const avgConf = qConfList.length > 0 ? (qConfList.reduce((a, b) => a + b, 0) / qConfList.length) : null;
    const finalSpeechConfidence = avgConf !== null ? Math.round(avgConf * 100) : null;

    try {
      const { data } = await axios.post(`${API}/interview/evaluate`, {
        question: q.question, answer: finalAns, expectedKeyPoints: q.expectedKeyPoints || [], topic,
      });
      const ev = data.data;
      setFeedback(ev);
      setResults(p => [...p.filter(r => r.questionId !== q.id), {
        questionId: q.id, question: q.question, answer: finalAns,
        score: ev.score, maxScore: ev.maxScore, feedback: ev.feedback, isCorrect: ev.isCorrect,
        speechConfidence: finalSpeechConfidence,
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
    intentionalStopRef.current = true;
    recRef.current?.stop(); recRef.current = null; setIsRecording(false);

    // Finalize currently active question text & confidences
    const activeQId = activeQIdRef.current;
    if (activeQId) {
      finalizedTextRef.current = (finalizedTextRef.current + ' ' + sessionFinalsRef.current).replace(/\s+/g, ' ').trim();
      sessionFinalsRef.current = '';

      if (sessionConfidencesRef.current.length > 0) {
        questionConfidencesRef.current[activeQId] = [
          ...(questionConfidencesRef.current[activeQId] || []),
          ...sessionConfidencesRef.current
        ];
        sessionConfidencesRef.current = [];
      }

      // Update answers state so work isn't lost
      setAnswers(p => ({ ...p, [activeQId]: finalizedTextRef.current }));
    }

    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setFeedback(null); setIdx(i);
    setTimeout(() => speak(`Question ${i+1}. ${questions[i]?.question}`), 200);
  };

  const finish = async () => {
    intentionalStopRef.current = true;
    recRef.current?.stop(); recRef.current = null;
    if (synthRef.current) synthRef.current.cancel();
    setPhase('finishing');
    try {
      const finalResults = questions.map(q => {
        const r = results.find(r => r.questionId === q.id);
        if (r) return r;

        const ans = answers[q.id] || '';
        const qConfList = questionConfidencesRef.current[q.id] || [];
        const avgConf = qConfList.length > 0 ? (qConfList.reduce((a, b) => a + b, 0) / qConfList.length) : null;
        const finalSpeechConfidence = avgConf !== null ? Math.round(avgConf * 100) : null;

        return {
          questionId: q.id,
          question: q.question,
          answer: ans,
          score: 0,
          maxScore: 10,
          feedback: 'Not answered.',
          isCorrect: false,
          speechConfidence: finalSpeechConfidence
        };
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
        
        <div className="relative z-10 text-center max-w-md w-full glass-card p-6 sm:p-10 border border-dark-800/80 shadow-2xl">
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
        
        <div className="relative z-10 text-center max-w-md w-full glass-card p-6 sm:p-10 border border-dark-800/80 shadow-2xl">
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
      <div className="w-72 border-r border-dark-800 bg-dark-950/40 hidden lg:flex flex-col p-8 shrink-0 relative overflow-hidden">
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
        </div>
      </div>

      {/* Main Assessment Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/[0.01] blur-[150px] rounded-full pointer-events-none" />
        
        {/* Mobile Mini Header */}
        <div className="sticky top-0 z-50 lg:hidden flex items-center justify-between py-4 px-4 -mx-4 sm:-mx-8 border-b border-dark-800/80 backdrop-blur-md bg-governance/85 mb-8 shadow-sm">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">{topic}</span>
              <span className="text-xs font-black text-dark-100">Round 0{idx + 1} of 0{totalQ}</span>
           </div>
           <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="status-active py-1 px-2 text-[9px] font-black tracking-widest">Active</div>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          {/* Header (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-between mb-8">
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
          <div className="glass-card p-4 sm:p-10 mb-8 border-dark-800/80 relative shadow-2xl">
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

            {/* Input Mode Selector Tab */}
            <div className="flex gap-3 mb-5 border-b border-dark-800/40 pb-4 relative z-10">
              <button
                type="button"
                onClick={() => handleInputModeChange('voice')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  inputMode === 'voice'
                    ? 'bg-primary-600/15 border border-primary-500/20 text-primary-400 font-extrabold shadow-sm'
                    : 'text-dark-500 hover:text-dark-300 border border-transparent hover:bg-dark-900/10'
                }`}
              >
                <HiMicrophone className="w-4 h-4" />
                Voice Interview Mode
              </button>
              <button
                type="button"
                onClick={() => handleInputModeChange('text')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-primary-600/15 border border-primary-500/20 text-primary-400 font-extrabold shadow-sm'
                    : 'text-dark-500 hover:text-dark-300 border border-transparent hover:bg-dark-900/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Text Input Mode
              </button>
            </div>

            {/* Response Form Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
              {inputMode === 'voice' ? (
                <>
                  {/* Voice Interaction Circle */}
                  <div className="lg:col-span-1 flex flex-col items-center justify-center py-6 border-b lg:border-b-0 lg:border-r border-dark-800/40 pb-6 lg:pb-0 mb-6 lg:mb-0 relative">
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

                  {/* Voice Skeleton Area instead of Textarea */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <div className={`bg-dark-950/35 border rounded-2xl p-6 h-44 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 backdrop-blur-md ${
                      isRecording 
                        ? 'border-primary-500/40 shadow-lg shadow-primary-500/[0.05] bg-dark-950/50' 
                        : 'border-dark-800/90 hover:border-dark-700/80'
                    }`}>
                      {isRecording ? (
                        <>
                          {/* Ambient background glows */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/15 via-indigo-950/10 to-transparent pointer-events-none" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/[0.02] blur-3xl rounded-full pointer-events-none" />
                          
                          {/* Top status & feedback bar */}
                          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest text-primary-400 bg-primary-500/10 border border-primary-500/20 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
                              AI Listening
                            </span>
                            
                            {/* Live Word Count Indicator */}
                            {currentAns.trim() && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-dark-400 uppercase tracking-wider bg-dark-800/80 px-2 py-0.5 rounded border border-dark-700/60 animate-fade-in">
                                🎙️ {currentAns.trim().split(/\s+/).length} Words Recorded
                              </span>
                            )}
                          </div>

                          {/* Organic Soundwave Visualizer */}
                          <div className="flex items-end gap-1 mb-2 h-14 relative z-10 pt-4">
                            {[...Array(24)].map((_, i) => {
                              // Create asymmetric wave pattern
                              const delay = (i * 0.05).toFixed(2);
                              const baseHeight = 12 + Math.abs(Math.sin(i * 0.4)) * 28;
                              return (
                                <div
                                  key={i}
                                  className="w-1 rounded-full origin-bottom transition-all duration-300 bg-gradient-to-t from-primary-600 via-indigo-500 to-teal-400"
                                  style={{
                                    height: `${baseHeight}px`,
                                    animation: `waveBar 0.55s ease-in-out ${delay}s infinite alternate`
                                  }}
                                />
                              );
                            })}
                          </div>
                          
                          <div className="text-center relative z-10 mt-1">
                            <p className="text-[10px] text-dark-300 font-bold uppercase tracking-wider">
                              Analyzing your response... speak clearly at your own pace
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Idle state */}
                          <div className="w-12 h-12 rounded-full border border-dark-800/80 flex items-center justify-center mb-3 bg-dark-900/60 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <HiMicrophone className="w-5 h-5 text-dark-500" />
                          </div>
                          <div className="text-center">
                            <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest text-dark-500 bg-dark-800 border border-dark-700/60 uppercase mb-2">
                              {/* Microphone Inactive */}
                               Click the mic button to start recording your response
                            </span>
                            
                          
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="lg:col-span-5">
                  <div className="bg-dark-950/30 border border-dark-800/80 rounded-xl p-5 h-44 focus-within:border-primary-500/40 focus-within:bg-dark-950/50 transition-all duration-300">
                     <textarea
                      value={currentAns}
                      onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-dark-100 placeholder-dark-600 resize-none text-xs font-semibold leading-relaxed outline-none"
                      placeholder="Type your response here. Take your time to write a detailed answer..."
                    />
                  </div>
                </div>
              )}
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
