import { NextResponse } from 'next/server';

interface SurveyResponse {
  protectedDataAddress: string;
  owner: string;
  surveyProjectId?: string;
  submissionTimestampClient?: string;
  apiReceivedTimestamp?: string;
  timestamp?: string;
}

// Temporary in-memory storage for demo purposes
// In production, this would be a proper database
const surveyResponses: SurveyResponse[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.protectedDataAddress || !body.owner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the encrypted survey data reference
    surveyResponses.push({
      protectedDataAddress: body.protectedDataAddress,
      owner: body.owner,
      surveyProjectId: body.surveyProjectId,
      submissionTimestampClient: body.submissionTimestampClient,
      apiReceivedTimestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Survey response stored successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing survey response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 