import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper: Calculate average
function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

// Helper: Get current ISO timestamp
function nowISO() {
  return new Date().toISOString();
}

// Helper: Get all rating question IDs
const RATING_QUESTION_IDS = [
  'core_advocacy',
  'core_loyalty',
  'core_satisfaction',
  'driver_accomplishment',
  'driver_autonomy',
  'driver_growth_main',
  'driver_growth_learning',
  'driver_managementsupport_main',
  'driver_managementsupport_caring',
  'driver_meaningfulwork_main',
  'driver_workload_main',
];

// Helper: Get question text by ID (for report)
const QUESTION_TEXTS = {
  core_advocacy:
    'How likely is it you would recommend [Our Company] as a place to work?',
  core_loyalty:
    'How likely is it that you would stay with [Our Company] if you were offered a similar role at another organization?',
  core_satisfaction:
    'Overall, how satisfied are you working for [Our Company]?',
  driver_accomplishment:
    'Most days I feel a sense of accomplishment from what I do.',
  driver_autonomy: "I'm given enough freedom to decide how to do my work.",
  driver_growth_main:
    "I feel that I'm growing professionally at [Our Company].",
  driver_growth_learning:
    'My role at [Our Company] enables me to learn and develop new skills.',
  driver_managementsupport_main:
    'My manager provides me with the support I need to complete my work.',
  driver_managementsupport_caring: 'My manager cares about me as a person.',
  driver_meaningfulwork_main:
    'The work I do at [Our Company] is meaningful to me.',
  driver_workload_main: 'The demands of my workload are manageable.',
};

// Main entry
async function main() {
  // iExec passes args as process.argv[2] (stringified JSON or file path)
  let input = process.argv[2];
  let surveyResponses = [];

  if (!input) {
    console.error(
      'No input provided. Pass a JSON file or stringified array of survey responses.'
    );
    process.exit(1);
  }

  // Try to load input as file or JSON string
  try {
    // Try to read as file
    try {
      const fileContent = await fs.readFile(input, 'utf8');
      surveyResponses = JSON.parse(fileContent);
    } catch (e) {
      // Not a file, try as JSON string
      surveyResponses = JSON.parse(input);
    }
  } catch (e) {
    console.error('Failed to parse input:', e);
    process.exit(1);
  }

  // Expect surveyResponses to be an array of objects with .responses (array)
  // Flatten all responses into a single array of {questionId, answerValue}
  let allResponses = [];
  let surveyProjectId = 'unknown';
  let companyNamePlaceholder = '';
  for (const resp of surveyResponses) {
    if (resp.surveyProjectId) surveyProjectId = resp.surveyProjectId;
    if (resp.companyNamePlaceholder)
      companyNamePlaceholder = resp.companyNamePlaceholder;
    if (Array.isArray(resp.responses)) {
      allResponses.push(resp.responses);
    }
  }
  allResponses = allResponses.flat();

  // Aggregate scores for each rating question
  const aggregatedScores = RATING_QUESTION_IDS.map((qid) => {
    const values = allResponses
      .filter((r) => r.questionId === qid && typeof r.answerValue === 'number')
      .map((r) => r.answerValue);
    return {
      questionId: qid,
      questionText: QUESTION_TEXTS[qid],
      averageScore: values.length ? Number(average(values).toFixed(2)) : null,
    };
  });

  // Overall Engagement Score: average of the first 3 core questions
  const coreScores = aggregatedScores
    .slice(0, 3)
    .map((q) => q.averageScore)
    .filter((v) => typeof v === 'number');
  const overallEngagementScore = coreScores.length
    ? Number(average(coreScores).toFixed(2))
    : null;

  // Collect all open comments
  const anonymousComments = allResponses
    .filter(
      (r) =>
        r.questionId === 'open_comment' &&
        typeof r.answerValue === 'string' &&
        r.answerValue.trim()
    )
    .map((r) => r.answerValue);

  const report = {
    appVersion: 'Sum_v0.1_report',
    surveyProjectId,
    companyNamePlaceholder,
    aggregationTimestamp: nowISO(),
    totalResponsesProcessed: surveyResponses.length,
    aggregatedScores,
    overallEngagementScore,
    anonymousComments,
  };

  // Write output to output/computed.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = process.env.IEXEC_OUT || path.join(__dirname, '../output');
  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch {}
  await fs.writeFile(
    path.join(outDir, 'computed.json'),
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify(report));
}

main();
