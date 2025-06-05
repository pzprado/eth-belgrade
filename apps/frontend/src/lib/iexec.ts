import { IExecDataProtectorCore } from '@iexec/dataprotector';
import JSZip from 'jszip';
import type { Eip1193Provider } from 'ethers';
import { ethers } from 'ethers';

// This would come from environment variables in production
const IEXEC_APP_ADDRESS = process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS || '0xF8e28d5776283b55455CECE9d1962AFd42113ABD';
const TDX_SMS_URL = process.env.NEXT_PUBLIC_IEXEC_TDX_SMS_URL || 'https://sms.labs.iex.ec';
const TDX_WORKERPOOL = process.env.NEXT_PUBLIC_IEXEC_TDX_WORKERPOOL || 'tdx-labs.pools.iexec.eth';
const SURVEY_PROJECT_ID = process.env.NEXT_PUBLIC_SURVEY_PROJECT_ID || 'sum_alpha';

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface ProtectedSurveyData {
  protectedDataAddress: string;
  owner: string;
}

// New type for survey submission
export interface SurveySubmission {
  responses: Array<{ questionId: string; answerValue: number | string | null }>;
}

// Module-level flag to prevent concurrent network switch requests
let isSwitchingNetwork = false;

// Helper: Switch to iExec Bellecour network
export async function switchToBellecour() {
  if (isSwitchingNetwork) {
    throw new Error(
      'A network switch request is already pending. Please check your MetaMask extension and approve or reject the pending request, then try again.'
    );
  }
  const bellecourParams = {
    chainId: '0x86', // 134 in hex
    chainName: 'iExec Bellecour',
    nativeCurrency: { name: 'xRLC', symbol: 'xRLC', decimals: 18 },
    rpcUrls: ['https://bellecour.iex.ec'],
    blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
  };
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // 1. Check current chainId
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId === '0x86') {
        // Already on Bellecour, nothing to do
        return true;
      }
      isSwitchingNetwork = true;
      // 2. Try to switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x86' }],
        });
        isSwitchingNetwork = false;
        return true;
      } catch (switchErr: any) {
        // 3. If the error is "unknown chain", try to add it
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [bellecourParams],
          });
          // Try switching again after adding
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x86' }],
          });
          isSwitchingNetwork = false;
          return true;
        }
        isSwitchingNetwork = false;
        throw switchErr;
      }
    } catch (err: any) {
      isSwitchingNetwork = false;
      if (err && err.code === -32002) {
        throw new Error(
          "A network request is already pending in MetaMask. Please check your MetaMask extension and approve or reject the pending request, then try again."
        );
      }
      if (
        err &&
        (err.message?.includes('p is not a function') ||
         err.message?.includes('Unrecognized chain ID') ||
         err.code === -32603)
      ) {
        throw new Error(
          'MetaMask does not support the iExec Bellecour network by default. Please add it manually in your wallet:\n\n' +
          'Network Name: iExec Bellecour\n' +
          'RPC URL: https://bellecour.iex.ec\n' +
          'Chain ID: 134\n' +
          'Currency Symbol: xRLC\n' +
          'Block Explorer: https://blockscout-bellecour.iex.ec'
        );
      }
      throw err;
    }
  }
  throw new Error('No Ethereum provider found. Please connect your wallet.');
}

export async function protectSurveyData(
  surveyData: SurveySubmission
): Promise<ProtectedSurveyData> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      console.error('No Ethereum provider found. Please connect your wallet.');
      throw new Error('No Ethereum provider found. Please connect your wallet.');
    }
    // Ensure wallet is on Bellecour
    await switchToBellecour();
    const provider = window.ethereum as Eip1193Provider;
    const dataProtector = new IExecDataProtectorCore(provider, {
      iexecOptions: { smsURL: TDX_SMS_URL },
    });

    // Convert responses array to object for iExec DataProtector
    const responsesObject = surveyData.responses.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.questionId]: curr.answerValue,
      }),
      {}
    );

    // Prepare the data object (new structure)
    const dataObject = {
      appVersion: 'Sum_v0.1',
      surveyProjectId: SURVEY_PROJECT_ID,
      submissionTimestamp: new Date().toISOString(),
      responses: responsesObject,
    };

    console.log('Protecting survey data with iExec DataProtector...', dataObject);
    // Protect the data
    const protectedData = await dataProtector.protectData({
      name: 'Anonymous Survey Response',
      data: dataObject,
    });
    console.log('Protected data created:', protectedData.address);

    // Grant access to the iApp
    await dataProtector.grantAccess({
      protectedData: protectedData.address,
      authorizedApp: IEXEC_APP_ADDRESS,
      authorizedUser: '0x0000000000000000000000000000000000000000', // Allow any user
    });
    console.log('Access granted to iApp:', IEXEC_APP_ADDRESS);

    console.log('Survey data protection and grantAccess successful.');
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
  iAppAddress = process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS || '0xF8e28d5776283b55455CECE9d1962AFd42113ABD',
}: {
  protectedDataAddresses: string[];
  iAppAddress?: string;
}): Promise<AggregationResult[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please connect your wallet.');
  }
  // Ensure wallet is on Bellecour
  await switchToBellecour();
  const provider = window.ethereum as Eip1193Provider;
  const dataProtector = new IExecDataProtectorCore(provider, {
    iexecOptions: { smsURL: TDX_SMS_URL },
  });
  // For batch aggregation, pass all addresses as args (if your iApp supports it)
  // Otherwise, process one by one (current logic)
  console.log('Triggering iExec aggregation for addresses:', protectedDataAddresses);
  const results: AggregationResult[] = [];
  for (const address of protectedDataAddresses) {
    const res = await dataProtector.processProtectedData({
      protectedData: address,
      app: iAppAddress,
      args: SURVEY_PROJECT_ID,
      workerpool: TDX_WORKERPOOL,
    });
    console.log('Started iExec task for address:', address, 'taskId:', res.taskId);
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
  console.log('Fetching iExec result for taskId:', taskId);
  const result = await dataProtector.getResultFromCompletedTask({ taskId });
  // result.result is an ArrayBuffer (zip file)
  const zip = await JSZip.loadAsync(result.result);
  const computedJson = await zip.file('computed.json')?.async('string');
  if (!computedJson) throw new Error('computed.json not found in iExec result');
  console.log('Fetched and parsed iExec result for taskId:', taskId);
  return JSON.parse(computedJson);
} 