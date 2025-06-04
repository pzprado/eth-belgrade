import { IExecDataProtector } from '@iexec/dataprotector';

// This would come from environment variables in production
const IEXEC_APP_ADDRESS = 'YOUR_DEPLOYED_IAPP_ADDRESS';

export async function protectSurveyData(surveyData: any) {
  try {
    const dataProtector = new IExecDataProtector();
    
    // Convert survey data to string
    const surveyDataString = JSON.stringify({
      appVersion: 'Sum_v0.1',
      surveyId: `pulse_${new Date().toISOString().split('T')[0]}`,
      submissionTimestamp: new Date().toISOString(),
      responses: [
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
      ]
    });

    // Protect the data
    const protectedData = await dataProtector.protectData({
      data: surveyDataString,
      name: 'Anonymous Survey Response'
    });

    // Grant access to the iApp
    await dataProtector.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: IEXEC_APP_ADDRESS,
      authorizedUser: undefined
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