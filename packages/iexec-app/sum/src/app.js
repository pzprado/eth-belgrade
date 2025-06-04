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

  // Expect surveyResponses to be an array of flat objects (no .responses)
  // TDX compatible: schema must match frontend protectData

  // Aggregate scores and comments
  const ratingQuestions = [
    {
      questionId: 'q1_workload',
      questionText: 'How manageable is your current workload?',
    },
    {
      questionId: 'q2_manager_support',
      questionText: 'How supported do you feel by your direct manager?',
    },
    {
      questionId: 'q3_company_alignment',
      questionText: "How well do you feel aligned with the company's goals?",
    },
  ];

  const scores = {
    q1_workload: [],
    q2_manager_support: [],
    q3_company_alignment: [],
  };
  const comments = [];
  let surveyId = 'unknown';

  for (const resp of surveyResponses) {
    if (resp.surveyId) surveyId = resp.surveyId;
    if (typeof resp.q1_workload === 'number')
      scores.q1_workload.push(resp.q1_workload);
    if (typeof resp.q2_manager_support === 'number')
      scores.q2_manager_support.push(resp.q2_manager_support);
    if (typeof resp.q3_company_alignment === 'number')
      scores.q3_company_alignment.push(resp.q3_company_alignment);
    if (resp.q4_open_comment) comments.push(resp.q4_open_comment);
  }

  const aggregatedScores = ratingQuestions.map((q) => ({
    questionId: q.questionId,
    questionText: q.questionText,
    averageScore: Number(average(scores[q.questionId]).toFixed(2)),
  }));

  const overallSentimentScore = Number(
    average(aggregatedScores.map((q) => q.averageScore)).toFixed(2)
  );

  const report = {
    appVersion: 'Sum_v0.1_report',
    surveyId,
    aggregationTimestamp: nowISO(),
    totalResponses: surveyResponses.length,
    aggregatedScores,
    overallSentimentScore,
    anonymousComments: comments,
  };

  // Write output to iexec_out/computed.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir =
    process.env.IEXEC_OUT || path.join(__dirname, '../../iexec_out');
  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch {}
  await fs.writeFile(
    path.join(outDir, 'computed.json'),
    JSON.stringify(report, null, 2)
  );
  console.log(
    'Aggregated report written to',
    path.join(outDir, 'computed.json')
  );
}

main();
