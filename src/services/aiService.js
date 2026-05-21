/**
 * AI Service — LangChain + Gemini with RAG Knowledge Injection
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getRelevantContext } from './knowledgeBase';
import { normalizeTranscript } from './speechNormalizer';

const isAIAvailable = () =>
  process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

const getModel = (temp = 0.7) =>
  new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: temp,
    maxOutputTokens: 2048,
  });

// ====================================================
// 1. GENERATE QUESTIONS (RAG-enhanced)
// ====================================================
export const generateQuestions = async (topic, count = 5, difficulty = 'medium') => {
  if (!isAIAvailable()) return buildFallbackQuestions(topic, count, difficulty);

  const kb = getRelevantContext(topic);

  try {
    const model = getModel(0.85);

    const systemPrompt = `You are a friendly, natural Interviewer and Examiner conducting a mock interview for the role/field: "${topic}".
RULES:
1. Generate ONLY very basic, simple, and standard questions.
2. DO NOT ask tricky questions, deep technical edge cases, or complex scenario problems.
3. The questions should be suitable for a student or entry-level candidate in Pakistan.
4. Focus on personal introduction, academic background/studies, Final Year Project (FYP) if applicable, and basic core concepts of "${topic}".

DOMAIN CONTEXT & SAMPLE QUESTIONS:
${kb.context}`;

    const humanPrompt = `Generate exactly ${count} unique interview questions for: "${topic}"

Rules:
- The questions MUST be extremely basic, standard, and natural.
- Start with a simple personal/study introduction or project question, then move to basic fundamental concepts of "${topic}".
- DO NOT generate complex, long, or tricky questions.
- Keep each question to 1 sentence, maximum 2 sentences.
- expectedKeyPoints should contain 2-4 simple key terms or concepts the answer should cover.

Respond in ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "category": "${topic}",
      "difficulty": "${difficulty}",
      "expectedKeyPoints": ["point1", "point2"]
    }
  ]
}`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);

    const jsonMatch = response.content.trim().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.questions?.length > 0) return result.questions;
    }
    throw new Error('Parse error');
  } catch (error) {
    console.error('AI generate failed:', error.message);
    return buildFallbackQuestions(topic, count, difficulty);
  }
};

// ====================================================
// 2. EVALUATE ANSWER (RAG-enhanced + speech-normalized)
// ====================================================
export const evaluateAnswer = async (question, answer, expectedKeyPoints = [], topic = '') => {
  if (!answer || answer.trim().length < 3) {
    return { score: 0, maxScore: 10, feedback: 'No answer was provided.', isCorrect: false };
  }

  // Normalize voice transcription errors
  const cleanAnswer = normalizeTranscript(answer);

  if (!isAIAvailable()) return fallbackEvaluate(cleanAnswer, expectedKeyPoints);

  // Get topic context for better understanding
  const kb = topic ? getRelevantContext(topic) : null;

  try {
    const model = getModel(0.3);

    const systemPrompt = `You are a friendly and professional Interviewer evaluating answers for: "${topic}".
1. Keep your feedback simple, natural, conversational, and direct (like a real human interviewer).
2. DO NOT use generic boilerplate template phrases like "Solid answer demonstrating...", "Decent attempt...", "Good job starting...", or similar repetitive structures.
3. React naturally to the content of the answer. State clearly whether the answer is good, bad/incorrect, or partially correct, and give a simple reason why in a warm, helpful tone.
4. BE VOICE-AWARE: Since this is transcribed voice, ignore minor grammar errors or typos. Focus on the core meaning.
5. IF THE CANDIDATE INDICATES LACK OF KNOWLEDGE ("I don't know", "no idea", "pass", "skip", etc.): Assign a score of 0, set "isCorrect" to false, and set the feedback to react naturally (e.g., "No problem, we can skip this question. Let's move on to the next one.").

DOMAIN CONTEXT:
${kb ? kb.context : 'Access internal knowledge for ' + topic}`;

    const humanPrompt = `Question: "${question}"
Expected key points: ${expectedKeyPoints.length > 0 ? expectedKeyPoints.join(', ') : 'N/A'}
Candidate's answer (voice transcription): "${cleanAnswer}"

Evaluate the answer.

Respond in ONLY valid JSON:
{
  "score": <0-10>,
  "feedback": "<Simple, natural, and direct conversational feedback. React directly to what the candidate said. State clearly if it is a good answer, bad/incorrect answer, or partially correct, and briefly say why in a friendly tone. Max 1-2 short sentences.>",
  "isCorrect": <true if score >= 6>
}`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(humanPrompt),
    ]);
    const jsonMatch = response.content.trim().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const r = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(0, Number(r.score) || 0)),
        maxScore: 10,
        feedback: r.feedback || 'Evaluated.',
        isCorrect: (Number(r.score) || 0) >= 6,
      };
    }
    throw new Error('Parse error');
  } catch (error) {
    console.error('AI evaluate failed:', error.message);
    return fallbackEvaluate(cleanAnswer, expectedKeyPoints);
  }
};

// ====================================================
// 3. GENERATE REPORT (RAG-enhanced)
// ====================================================
export const generateReport = async (topic, results) => {
  const totalQ = results.length;
  const totalScore = results.reduce((s, r) => s + (r.score || 0), 0);
  const maxScore = totalQ * 10;
  const percentage = totalQ > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const correct = results.filter(r => r.isCorrect).length;
  const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

  const base = { topic, score: percentage, accuracy, totalMarks: totalScore, maxMarks: maxScore };

  if (!isAIAvailable()) return { ...base, ...fallbackReport(percentage, accuracy) };

  try {
    const model = getModel(0.5);

    const summary = results.map((r, i) =>
      `Q${i+1}: Score ${r.score}/10 | ${r.isCorrect ? 'PASS' : 'FAIL'} | "${r.question}"`
    ).join('\n');

    const prompt = `Analyze this interview performance and create a coaching report.

Topic: ${topic}
Score: ${percentage}% | Accuracy: ${accuracy}% | Marks: ${totalScore}/${maxScore}

Results:
${summary}

Respond in ONLY valid JSON:
{
  "confidenceLevel": <0-100>,
  "overallGrade": "<A+/A/B+/B/C+/C/D/F>",
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "suggestions": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "overallFeedback": "<3 sentence assessment — be specific to the topic>"
}`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const jsonMatch = response.content.trim().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const r = JSON.parse(jsonMatch[0]);
      return {
        ...base,
        confidenceLevel: Math.min(100, Math.max(0, r.confidenceLevel || percentage)),
        overallGrade: r.overallGrade || getGrade(percentage),
        strengths: r.strengths || [],
        weaknesses: r.weaknesses || [],
        suggestions: r.suggestions || [],
        overallFeedback: r.overallFeedback || '',
        questions: results,
      };
    }
    throw new Error('Parse error');
  } catch (error) {
    console.error('AI report failed:', error.message);
    return { ...base, ...fallbackReport(percentage, accuracy), questions: results };
  }
};

// ====================================================
// FALLBACKS
// ====================================================

const buildFallbackQuestions = (topic, count, difficulty) => {
  const topicLower = topic.toLowerCase();
  
  let list = [];
  if (topicLower.includes('software') || topicLower.includes('bscs')) {
    list = [
      "Tell me about yourself and why you chose Software Engineering.",
      "What is the difference between Object-Oriented Programming (OOP) and Procedural Programming?",
      "What is an API and how does it help software systems communicate?",
      "Can you explain the difference between a DBMS and a File System?",
      "What is inheritance in OOP and how do you use it?",
      "What is the difference between a stack and a queue data structure?",
      "Tell me about your final year project (FYP). What technologies did you use?",
      "Why should we hire you and what are your strengths and weaknesses?"
    ];
  } else if (topicLower.includes('css') || topicLower.includes('pms') || topicLower.includes('government')) {
    list = [
      "Introduce yourself and share your educational background.",
      "Why do you want to join the civil service of Pakistan?",
      "What are the major problems that Pakistan is facing today?",
      "How would you explain inflation and its impact on the public in simple terms?",
      "What are the key leadership qualities of Quaid-e-Azam Muhammad Ali Jinnah?",
      "What is bureaucracy and why is it important in governance?",
      "What is the difference between democracy and dictatorship?"
    ];
  } else if (topicLower.includes('banking')) {
    list = [
      "Why do you want to start a career in the banking sector?",
      "What is an interest rate in simple terms?",
      "What is the difference between a current account and a savings account?",
      "How would you handle an angry or demanding customer at the branch?",
      "Why is teamwork important when working in a bank branch?",
      "Why should we hire you for this bank job?"
    ];
  } else if (topicLower.includes('hr') || topicLower.includes('behavioral')) {
    list = [
      "Tell me about yourself.",
      "Why do you want this job?",
      "Where do you see yourself in 5 years?",
      "Describe a challenge you faced and how you handled it.",
      "Why did you leave your previous job (or why are you looking for a change)?",
      "What are your weaknesses?",
      "How do you handle work pressure and tight deadlines?"
    ];
  } else if (topicLower.includes('call center') || topicLower.includes('support')) {
    list = [
      "Can you comfortably communicate in English with international customers?",
      "How will you deal with a customer who is being rude or shouting at you?",
      "Why should we select you for this BPO customer support role?",
      "Sell me this pen.",
      "What does customer satisfaction mean to you?"
    ];
  } else if (topicLower.includes('teacher') || topicLower.includes('lecturer')) {
    list = [
      "Why do you want to become a teacher/lecturer?",
      "What is your teaching methodology for engaging students?",
      "How do you manage weak or slow students in your class?",
      "What is the difference between education and learning?"
    ];
  } else if (topicLower.includes('fresh') || topicLower.includes('intern')) {
    list = [
      "Tell me about yourself and your academic achievements.",
      "Explain your final year project (FYP) and what you built.",
      "What programming technologies or software tools do you know?",
      "Why should we select you as an intern?",
      "What are your long-term career goals?"
    ];
  } else {
    list = [
      `Introduce yourself and tell me why you are interested in ${topic}.`,
      `What are the basic fundamentals every professional should know about ${topic}?`,
      `Can you share a simple example of how you apply ${topic} in real life?`,
      `What are the most common challenges people face when working with ${topic}?`,
      `What are your career goals related to ${topic}?`
    ];
  }

  // Shuffle slightly but make sure the first question is always the introduction if available
  const introQuestion = list.find(q => q.toLowerCase().includes('introduce') || q.toLowerCase().includes('about yourself') || q.toLowerCase().includes('career in'));
  const remaining = list.filter(q => q !== introQuestion);
  const shuffled = remaining.sort(() => Math.random() - 0.5);
  const finalQuestions = introQuestion ? [introQuestion, ...shuffled] : shuffled;

  return finalQuestions.slice(0, count).map((q, i) => ({
    id: i + 1,
    question: q,
    category: topic,
    difficulty,
    expectedKeyPoints: [],
  }));
};

const fallbackEvaluate = (answer, keyPoints) => {
  const cleanAns = answer.trim().toLowerCase();
  
  // Check if candidate expresses lack of understanding or requests repeat
  const dontUnderstandPhrases = [
    "don't understand", "do not understand", "dont understand", "cant understand", "can't understand",
    "repeat the question", "repeat please", "could you repeat", "can you repeat",
    "what you say", "what you mean", "not understand", "didn't understand", "did not understand",
    "repeat it", "pardon"
  ];
  
  // Check if candidate expresses lack of knowledge
  const dontKnowPhrases = [
    "don't know", "do not know", "dont know", "no idea", "not sure", "no clue", 
    "i pass", "skip this", "skip", "have no idea"
  ];

  const expressesDontUnderstand = dontUnderstandPhrases.some(phrase => cleanAns.includes(phrase));
  const expressesDontKnow = dontKnowPhrases.some(phrase => cleanAns.includes(phrase));

  if (expressesDontUnderstand) {
    return {
      score: 0,
      maxScore: 10,
      feedback: "No problem! I can repeat it or we can skip. Let's move to the next question.",
      isCorrect: false
    };
  }

  if (expressesDontKnow) {
    return {
      score: 0,
      maxScore: 10,
      feedback: "No worries! It's okay not to know. Let's move on to the next question.",
      isCorrect: false
    };
  }

  const words = answer.trim().split(/\s+/).length;
  let score = Math.min(5, Math.round(words / 8));

  if (keyPoints.length > 0) {
    const matches = keyPoints.filter(kp => answer.toLowerCase().includes(kp.toLowerCase())).length;
    score = Math.min(10, score + Math.round((matches / keyPoints.length) * 5));
  } else {
    score = Math.min(10, score + (words > 25 ? 3 : words > 12 ? 2 : 0));
  }

  let feedback = '';
  if (score >= 8) {
    feedback = "Good answer! You explained the concept clearly and hit the main points.";
  } else if (score >= 5) {
    feedback = "That is a decent explanation, but it is a bit brief. Try to add a bit more details.";
  } else {
    feedback = "This answer is very short and doesn't explain the concept. Try to elaborate more next time.";
  }

  return { score, maxScore: 10, feedback, isCorrect: score >= 6 };
};

const fallbackReport = (percentage, accuracy) => ({
  confidenceLevel: Math.max(0, percentage - 10),
  overallGrade: getGrade(percentage),
  strengths: percentage >= 60
    ? ['Completed all questions', 'Showed working knowledge']
    : ['Attempted the interview'],
  weaknesses: percentage < 60
    ? ['Answers need more technical depth', 'Review core concepts']
    : ['Some answers could include more examples'],
  suggestions: [
    'Practice explaining concepts clearly and concisely',
    'Use real-world examples to strengthen your answers',
    'Review fundamentals regularly to build confidence',
  ],
  overallFeedback: percentage >= 80
    ? 'Strong performance showing solid expertise.'
    : percentage >= 60
    ? 'Good foundation with room for deeper understanding.'
    : 'Focus on strengthening your fundamentals through consistent study.',
});

const getGrade = (p) =>
  p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B'
  : p >= 50 ? 'C+' : p >= 40 ? 'C' : p >= 30 ? 'D' : 'F';
