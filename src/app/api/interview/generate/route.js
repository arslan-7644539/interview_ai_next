import { NextResponse } from 'next/server';
import { generateQuestions } from '@/services/aiService';

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, numberOfQuestions = 5, difficulty = 'medium' } = body;

    if (!topic || topic.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Please provide a valid topic' }, { status: 400 });
    }

    const questions = await generateQuestions(topic.trim(), numberOfQuestions, difficulty);

    return NextResponse.json({
      success: true,
      data: { topic: topic.trim(), difficulty, questions },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate questions' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
