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

    const systemPrompt = `You are a Universal Professional Auditor and Domain Expert for: "${topic}".
1. Pivot your entire logic, tone, and rigor to match this specific field.
2. For POLICE: Focus on law, rights, ethics, and tactical reasoning.
3. For CODING: Focus on logic, architecture, and technical depth.
4. For OTHER: Access your internal training to act as a senior professional in THAT field.

DOMAIN CONTEXT & STANDARDS:
${kb.context}`;

    const humanPrompt = `Generate exactly ${count} unique interview questions for: "${topic}"
Difficulty: ${difficulty}

Rules:
- NEVER repeat core concepts; each question must test a different area.
- AVOID generic "What is..." questions. Focus on practical/technical application.
- If this is a specialized domain (e.g. Army, Medical, etc.), use the specific professional terminology of that field.
- For ${difficulty} difficulty: ${{
  easy: 'test standard protocols and key operational concepts',
  medium: 'test application of knowledge in complex scenarios',
  hard: 'test extreme edge cases and strategic tradeoffs'
}[difficulty]}
- Keep each question to 1-2 sentences maximum
- expectedKeyPoints should contain 3-5 specific terms/concepts the answer MUST cover

Respond in ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "category": "${topic}",
      "difficulty": "${difficulty}",
      "expectedKeyPoints": ["point1", "point2", "point3"]
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

    const systemPrompt = `You are a Universal Professional Auditor and Examiner for: "${topic}".
1. Pivot your evaluation criteria to match the highest standards of "${topic}".
2. For POLICE: Grade strictly on legal compliance, situational ethics, and safety protocols.
3. For CODING: Grade strictly on logic, performance, and technical accuracy.
4. BE VOICE-AWARE: Technical terms may be phonetically transcribed. Be lenient on grammar, but EXTREMELY STRICT on professional facts and domain-specific terminology.
5. IF THE CANDIDATE INDICATES LACK OF KNOWLEDGE ("I don't know", "no idea", "pass") OR LACK OF UNDERSTANDING / REQUESTS REPEAT: Assign a score of 0, set "isCorrect" to false, and set the feedback to acknowledge this directly (e.g. "Candidate indicated they do not know the answer or did not understand the question. A review of this topic is recommended."). Do not evaluate it as a bad attempt at a technical answer.

DOMAIN CONTEXT:
${kb ? kb.context : 'Access internal knowledge for ' + topic}`;

    const humanPrompt = `Question: "${question}"
Expected key points: ${expectedKeyPoints.length > 0 ? expectedKeyPoints.join(', ') : 'N/A'}
Candidate's answer (voice transcription): "${cleanAnswer}"

Evaluate: accuracy, completeness, clarity, depth.

Respond in ONLY valid JSON:
{
  "score": <0-10>,
  "feedback": "<1-2 sentences specific constructive feedback>",
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
  const diffConfig = {
    easy: { prefix: 'What is', depth: 'basic' },
    medium: { prefix: 'Explain how', depth: 'detailed' },
    hard: { prefix: 'Compare and analyze', depth: 'advanced' },
  };
  const d = diffConfig[difficulty] || diffConfig.medium;

  const patterns = [
    `${d.prefix} ${topic} works and why is it important in the industry?`,
    `What are the core principles or concepts behind ${topic}?`,
    `Describe a real-world scenario where ${topic} would be critical.`,
    `What are common mistakes or pitfalls when working with ${topic}?`,
    `How would you explain the fundamentals of ${topic} to a colleague?`,
    `What distinguishes an expert in ${topic} from a beginner?`,
    `What are the latest trends or developments in ${topic}?`,
    `How do you approach problem-solving within ${topic}?`,
    `What tools, frameworks, or methodologies are commonly used in ${topic}?`,
    `Describe a challenging situation related to ${topic} and how you'd solve it.`,
    `What best practices should every professional know about ${topic}?`,
    `How does ${topic} integrate with other technologies or disciplines?`,
  ];

  // Shuffle for variety
  const shuffled = patterns.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count).map((q, i) => ({
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
      feedback: "Candidate indicated they did not understand the question or requested clarification.",
      isCorrect: false
    };
  }

  if (expressesDontKnow) {
    return {
      score: 0,
      maxScore: 10,
      feedback: "Candidate indicated they do not know the answer to this question.",
      isCorrect: false
    };
  }

  const words = answer.trim().split(/\s+/).length;
  let score = Math.min(5, Math.round(words / 8));

  if (keyPoints.length > 0) {
    const matches = keyPoints.filter(kp => answer.toLowerCase().includes(kp.toLowerCase())).length;
    score = Math.min(10, score + Math.round((matches / keyPoints.length) * 5));
  } else {
    score = Math.min(10, score + (words > 30 ? 3 : words > 15 ? 2 : 0));
  }

  const feedback = score >= 7 ? 'Solid answer demonstrating good understanding.'
    : score >= 4 ? 'Decent attempt — try to be more specific and detailed.'
    : 'Answer needs significant improvement. Cover key concepts.';

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
