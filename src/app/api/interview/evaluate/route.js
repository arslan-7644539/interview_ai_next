import { NextResponse } from 'next/server';
import { evaluateAnswer } from '@/services/aiService';

export async function POST(req) {
  try {
    const body = await req.json();
    const { question, answer, expectedKeyPoints = [], topic = '' } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }

    const evaluation = await evaluateAnswer(question, answer || '', expectedKeyPoints, topic);

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Evaluate error:', error);
    return NextResponse.json({ success: false, error: 'Failed to evaluate answer' }, { status: 500 });
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
