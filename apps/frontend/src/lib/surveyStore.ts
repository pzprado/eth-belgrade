import fs from 'fs';
import path from 'path';

// Shared in-memory store for survey responses (demo only)
export interface SurveyResponse {
  protectedDataAddress: string;
  owner: string;
  surveyProjectId: string;
  submissionTimestampClient?: string;
  apiReceivedTimestamp?: string;
  timestamp?: string;
}

const DATA_FILE = path.join(process.cwd(), 'apps/frontend/src/lib/survey_responses.json');

function readResponses(): SurveyResponse[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data) as SurveyResponse[];
    }
  } catch (e) {
    console.error('Error reading survey responses:', e);
  }
  return [];
}

function writeResponses(responses: SurveyResponse[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing survey responses:', e);
  }
}

export function getSurveyResponses(): SurveyResponse[] {
  return readResponses();
}

export function addSurveyResponse(response: SurveyResponse) {
  const responses = readResponses();
  responses.push(response);
  writeResponses(responses);
} 