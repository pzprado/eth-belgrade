import { NextResponse } from 'next/server';
import { addSurveyResponse, SurveyResponse } from '@/lib/surveyStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.protectedDataAddress || !body.owner || !body.surveyProjectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the encrypted survey data reference
    addSurveyResponse({
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