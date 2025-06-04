import { IExecDataProtectorCore } from '@iexec/dataprotector';
import JSZip from 'jszip';
import type { Eip1193Provider } from 'ethers';

// This would come from environment variables in production
const IEXEC_APP_ADDRESS = process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS || '0xFallbackAddress';
const TDX_SMS_URL = process.env.NEXT_PUBLIC_IEXEC_TDX_SMS_URL || 'https://sms.labs.iex.ec';
const TDX_WORKERPOOL = process.env.NEXT_PUBLIC_IEXEC_TDX_WORKERPOOL || 'tdx-labs.pools.iexec.eth';
const SURVEY_PROJECT_ID = process.env.NEXT_PUBLIC_SURVEY_PROJECT_ID || 'sum_alpha';

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export interface ProtectedSurveyData {
  protectedDataAddress: string;
  owner: string;
}

export async function protectSurveyData(surveyData: {
  workload: number | null;
  managerSupport: number | null;
  companyAlignment: number | null;
  comments: string;
}): Promise<ProtectedSurveyData> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found. Please connect your wallet.');
    }
    const provider = window.ethereum as Eip1193Provider;
    const dataProtector = new IExecDataProtectorCore(provider, {
      iexecOptions: { smsURL: TDX_SMS_URL },
    });

    // Prepare the data object
    const dataObject: Record<string, string | number> = {
      appVersion: 'Sum_v0.1',
      surveyId: SURVEY_PROJECT_ID,
      submissionTimestamp: new Date().toISOString(),
      q1_workload: surveyData.workload ?? 0,
      q2_manager_support: surveyData.managerSupport ?? 0,
      q3_company_alignment: surveyData.companyAlignment ?? 0,
      q4_open_comment: surveyData.comments ?? '',
    };

    // Protect the data
    const protectedData = await dataProtector.protectData({
      name: 'Anonymous Survey Response',
      data: dataObject,
    });

    // Grant access to the iApp
    await dataProtector.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: IEXEC_APP_ADDRESS,
      authorizedUser: '', // No specific user, so pass empty string
    });

    return {
      protectedDataAddress: protectedData.address,
      owner: protectedData.owner,
    };
  } catch (error) {
    console.error('Error protecting survey data:', error);
    throw error;
  }
}

// Admin: Trigger aggregation on iExec
export interface AggregationResult {
  taskId: string;
}

export async function processProtectedData({
  protectedDataAddresses,
  iAppAddress = IEXEC_APP_ADDRESS,
}: {
  protectedDataAddresses: string[];
  iAppAddress?: string;
}): Promise<AggregationResult[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please connect your wallet.');
  }
  const provider = window.ethereum as Eip1193Provider;
  const dataProtector = new IExecDataProtectorCore(provider, {
    iexecOptions: { smsURL: TDX_SMS_URL },
  });
  const results: AggregationResult[] = [];
  for (const address of protectedDataAddresses) {
    // Each call processes one protected data object; for batch, see SDK docs
    const res = await dataProtector.processProtectedData({
      protectedData: address,
      app: iAppAddress,
      args: SURVEY_PROJECT_ID,
      workerpool: TDX_WORKERPOOL,
    });
    results.push({ taskId: res.taskId });
  }
  return results;
}

// Admin: Fetch aggregation result from iExec
export interface AggregationReport {
  appVersion: string;
  surveyId: string;
  aggregationTimestamp: string;
  totalResponses: number;
  aggregatedScores: Array<{
    questionId: string;
    questionText: string;
    averageScore: number;
  }>;
  overallSentimentScore: number;
  anonymousComments: string[];
}

export async function getResultFromCompletedTask(taskId: string): Promise<AggregationReport> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please connect your wallet.');
  }
  const provider = window.ethereum as Eip1193Provider;
  const dataProtector = new IExecDataProtectorCore(provider, {
    iexecOptions: { smsURL: TDX_SMS_URL },
  });
  const result = await dataProtector.getResultFromCompletedTask({ taskId });
  // result.result is an ArrayBuffer (zip file)
  const zip = await JSZip.loadAsync(result.result);
  const computedJson = await zip.file('computed.json')?.async('string');
  if (!computedJson) throw new Error('computed.json not found in iExec result');
  return JSON.parse(computedJson);
} 