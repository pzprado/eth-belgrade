'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SurveyRecord {
  protectedDataAddress: string;
  owner: string;
  timestamp: string;
}

export default function AdminPage() {
  const [surveyData, setSurveyData] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/getSurveyData');
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

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <Button className='w-full mb-4' disabled>
            Process Survey Results (iExec integration coming soon)
          </Button>
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
