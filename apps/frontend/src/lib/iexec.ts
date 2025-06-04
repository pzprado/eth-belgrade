import { IExecDataProtectorCore } from '@iexec/dataprotector';

// This would come from environment variables in production
const IEXEC_APP_ADDRESS = 'YOUR_DEPLOYED_IAPP_ADDRESS';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function arrayToObject<T>(arr: T[]): Record<string, T> {
  return arr.reduce((acc, item, idx) => {
    acc[idx] = item;
    return acc;
  }, {} as Record<string, T>);
}

export async function protectSurveyData(surveyData: any) {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Ethereum provider found. Please connect your wallet.');
    }
    const dataProtector = new IExecDataProtectorCore(window.ethereum);

    // Prepare the data object
    const responsesArray = [
      {
        questionId: 'q1_workload',
        questionText: 'How manageable is your current workload?',
        answerType: 'rating_1_5',
        answerValue: surveyData.workload
      },
      {
        questionId: 'q2_manager_support',
        questionText: 'How supported do you feel by your direct manager?',
        answerType: 'rating_1_5',
        answerValue: surveyData.managerSupport
      },
      {
        questionId: 'q3_company_alignment',
        questionText: 'How well do you feel aligned with the company\'s goals?',
        answerType: 'rating_1_5',
        answerValue: surveyData.companyAlignment
      },
      {
        questionId: 'q4_open_comment',
        questionText: 'Any additional comments or suggestions?',
        answerType: 'text',
        answerValue: surveyData.comments
      }
    ];
    const dataObject = {
      appVersion: 'Sum_v0.1',
      surveyId: `pulse_${new Date().toISOString().split('T')[0]}`,
      submissionTimestamp: new Date().toISOString(),
      responses: arrayToObject(responsesArray)
    };

    // Protect the data
    const protectedData = await dataProtector.protectData({
      name: 'Anonymous Survey Response',
      data: dataObject
    });

    // Grant access to the iApp
    await dataProtector.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: IEXEC_APP_ADDRESS,
      authorizedUser: '' // No specific user, so pass empty string
    });

    return {
      protectedDataAddress: protectedData.address,
      owner: protectedData.owner
    };
  } catch (error) {
    console.error('Error protecting survey data:', error);
    throw error;
  }
}

// Admin: Trigger aggregation on iExec
type AggregationResult = {
  taskId: string;
};

export async function processProtectedData({
  protectedDataAddresses,
  surveyProjectId,
  iAppAddress = IEXEC_APP_ADDRESS,
}: {
  protectedDataAddresses: string[];
  surveyProjectId: string;
  iAppAddress?: string;
}): Promise<AggregationResult[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please connect your wallet.');
  }
  const dataProtector = new IExecDataProtectorCore(window.ethereum);
  const results: AggregationResult[] = [];
  for (const address of protectedDataAddresses) {
    // Each call processes one protected data object; for batch, see SDK docs
    const res = await dataProtector.processProtectedData({
      protectedData: address,
      appAddress: iAppAddress,
      args: surveyProjectId,
    });
    results.push({ taskId: res.taskId });
  }
  return results;
}

// Admin: Fetch aggregation result from iExec
type AggregationReport = any; // Use a proper type if desired
export async function getResultFromCompletedTask(taskId: string): Promise<AggregationReport> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please connect your wallet.');
  }
  const dataProtector = new IExecDataProtectorCore(window.ethereum);
  const result = await dataProtector.getResultFromCompletedTask({ taskId });
  // result.result is a link to the computed.json file
  const response = await fetch(result.result);
  if (!response.ok) throw new Error('Failed to fetch aggregation result');
  return await response.json();
} 