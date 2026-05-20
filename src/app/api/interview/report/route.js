import { NextResponse } from 'next/server';
import { generateReport } from '@/services/aiService';

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, results } = body;

    if (!topic || !results || !Array.isArray(results)) {
      return NextResponse.json({ success: false, error: 'Topic and results are required' }, { status: 400 });
    }

    const report = await generateReport(topic, results);

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
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
