import { NextResponse } from 'next/server';

interface SurveyResponse {
  protectedDataAddress: string;
  owner: string;
  surveyProjectId: string;
  submissionTimestampClient?: string;
  apiReceivedTimestamp?: string;
}

// This would normally be imported from a shared location
// but for demo we're keeping it simple
const surveyResponses: SurveyResponse[] = [];

export async function GET() {
  try {
    return NextResponse.json(
      { 
        responses: surveyResponses,
        count: surveyResponses.length 
      },
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