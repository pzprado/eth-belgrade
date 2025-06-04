import { NextResponse } from 'next/server';

interface SurveyProject {
  surveyProjectId: string;
  projectName: string;
  employeeWhitelist: string[];
  creationTimestamp: string;
}

// In-memory storage for demo
const surveyProjects: SurveyProject[] = [];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectName, employeeWhitelist } = body;
    if (!projectName || !Array.isArray(employeeWhitelist) || employeeWhitelist.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const surveyProjectId = `${slugify(projectName)}_${Date.now()}`;
    const project: SurveyProject = {
      surveyProjectId,
      projectName,
      employeeWhitelist,
      creationTimestamp: new Date().toISOString(),
    };
    surveyProjects.push(project);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ projects: surveyProjects }, { status: 200 });
} 