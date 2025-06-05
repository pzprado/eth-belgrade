import { NextResponse } from 'next/server';
import { getSurveyResponses, SurveyResponse } from '@/lib/surveyStore';

interface SurveyResponse {
  protectedDataAddress: string;
  owner: string;
  surveyProjectId: string;
  submissionTimestampClient?: string;
  apiReceivedTimestamp?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyProjectId = searchParams.get('surveyProjectId');
    const allResponses = getSurveyResponses();
    let filtered = allResponses;
    if (surveyProjectId) {
      filtered = allResponses.filter((r: SurveyResponse) => r.surveyProjectId === surveyProjectId);
    }
    return NextResponse.json(
      { responses: filtered, count: filtered.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving survey responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 