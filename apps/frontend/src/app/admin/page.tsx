'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processProtectedData, getResultFromCompletedTask } from '@/lib/iexec';

interface SurveyRecord {
  protectedDataAddress: string;
  owner: string;
  timestamp: string;
}

const SURVEY_PROJECT_ID = 'demo_project'; // TODO: Replace with dynamic selection if needed

export default function AdminPage() {
  const [surveyData, setSurveyData] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggStatus, setAggStatus] = useState<
    'idle' | 'processing' | 'fetching' | 'done' | 'error'
  >('idle');
  const [aggError, setAggError] = useState<string | null>(null);
  const [aggReport, setAggReport] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/getSurveyData?surveyProjectId=${SURVEY_PROJECT_ID}`
        );
        if (!res.ok) throw new Error('Failed to fetch survey data');
        const data = await res.json();
        setSurveyData(data.responses || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAggregate = async () => {
    setAggStatus('processing');
    setAggError(null);
    setAggReport(null);
    try {
      const addresses = surveyData.map((rec) => rec.protectedDataAddress);
      if (addresses.length === 0)
        throw new Error('No survey data to aggregate');
      // For demo, process only the first address (can be extended to batch)
      const results = await processProtectedData({
        protectedDataAddresses: addresses,
        surveyProjectId: SURVEY_PROJECT_ID,
      });
      if (!results.length) throw new Error('No iExec task started');
      const { taskId } = results[0];
      setAggStatus('fetching');
      // Poll for result
      let report = null;
      let attempts = 0;
      while (attempts < 20) {
        try {
          report = await getResultFromCompletedTask(taskId);
          break;
        } catch (e) {
          await new Promise((res) => setTimeout(res, 5000));
        }
        attempts++;
      }
      if (!report)
        throw new Error(
          'Aggregation result not available yet. Try again later.'
        );
      setAggReport(report);
      setAggStatus('done');
    } catch (e: any) {
      setAggError(e.message || 'Aggregation failed');
      setAggStatus('error');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <Button
            className='w-full mb-4'
            onClick={handleAggregate}
            disabled={
              aggStatus === 'processing' ||
              aggStatus === 'fetching' ||
              surveyData.length === 0
            }
          >
            {aggStatus === 'processing'
              ? 'Processing on iExec...'
              : aggStatus === 'fetching'
              ? 'Fetching Result...'
              : 'Aggregate & View Report'}
          </Button>
          {aggError && <div className='text-destructive'>{aggError}</div>}
          {aggStatus === 'done' && aggReport && (
            <div className='bg-slate-100 rounded p-4 my-2'>
              <h3 className='font-semibold mb-2'>Aggregated Report</h3>
              <pre className='text-xs whitespace-pre-wrap'>
                {JSON.stringify(aggReport, null, 2)}
              </pre>
            </div>
          )}
          {loading && <div>Loading survey data...</div>}
          {error && <div className='text-destructive'>{error}</div>}
          {!loading && !error && (
            <div>
              {surveyData.length === 0 ? (
                <div>No survey responses yet.</div>
              ) : (
                <table className='w-full text-sm border mt-2'>
                  <thead>
                    <tr className='bg-slate-100'>
                      <th className='p-2 text-left'>Timestamp</th>
                      <th className='p-2 text-left'>Owner</th>
                      <th className='p-2 text-left'>Protected Data Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyData.map((rec, idx) => (
                      <tr key={idx} className='border-t'>
                        <td className='p-2'>{rec.timestamp}</td>
                        <td className='p-2'>{rec.owner}</td>
                        <td className='p-2 break-all'>
                          {rec.protectedDataAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
