import { NextResponse } from 'next/server';

// This would normally be imported from a shared location
// but for demo we're keeping it simple
let surveyResponses: any[] = [];

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