'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  processProtectedData,
  getResultFromCompletedTask,
  AggregationReport,
} from '@/lib/iexec';
import path from 'path';
import process from 'process';

interface SurveyRecord {
  protectedDataAddress: string;
  owner: string;
  timestamp: string;
}

const SURVEY_PROJECT_ID = 'sum_alpha'; // Hardcoded for hackathon scope
const DATA_FILE = path.join(
  process.cwd(),
  'apps/frontend/src/lib/survey_responses.json'
);

export default function AdminPage() {
  const [surveyData, setSurveyData] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aggStatus, setAggStatus] = useState<
    'idle' | 'processing' | 'fetching' | 'done' | 'error'
  >('idle');
  const [aggError, setAggError] = useState<string | null>(null);
  const [aggReport, setAggReport] = useState<AggregationReport | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
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
      const results = await processProtectedData({
        protectedDataAddresses: addresses,
      });
      if (!results.length) throw new Error('No iExec task started');
      const { taskId } = results[0];
      setAggStatus('fetching');
      let report: AggregationReport | null = null;
      let attempts = 0;
      while (attempts < 20) {
        try {
          report = await getResultFromCompletedTask(taskId);
          break;
        } catch {
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
    } catch (err) {
      setAggError(err instanceof Error ? err.message : 'Aggregation failed');
      setAggStatus('error');
    }
  };

  return (
    <div className='flex min-h-screen bg-slate-50'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r flex flex-col py-6 px-4'>
        <div className='mb-8 flex items-center gap-2'>
          <div className='bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg'>
            K
          </div>
          <span className='font-semibold text-lg'>Kinetar</span>
        </div>
        <nav className='flex-1'>
          <div className='mb-4'>
            <div className='uppercase text-xs text-slate-400 font-semibold mb-2'>
              Insight
            </div>
            <ul className='space-y-1'>
              <li>
                <span className='block bg-blue-50 text-blue-700 rounded px-3 py-2 font-medium'>
                  Engagement
                </span>
              </li>
              <li>
                <span className='block text-slate-700 rounded px-3 py-2 hover:bg-slate-100'>
                  Diversity and Inclusion
                </span>
              </li>
              <li>
                <span className='block text-slate-700 rounded px-3 py-2 hover:bg-slate-100'>
                  Health and Wellbeing
                </span>
              </li>
            </ul>
          </div>
          <div className='mb-4'>
            <div className='uppercase text-xs text-slate-400 font-semibold mb-2'>
              Comments
            </div>
            <ul className='space-y-1'>
              <li>
                <span className='block text-slate-700 rounded px-3 py-2 hover:bg-slate-100'>
                  All comments
                </span>
              </li>
              <li>
                <span className='block text-slate-700 rounded px-3 py-2 hover:bg-slate-100'>
                  Topics
                </span>
              </li>
            </ul>
          </div>
          <div>
            <div className='uppercase text-xs text-slate-400 font-semibold mb-2'>
              Actions
            </div>
            <ul className='space-y-1'>
              <li>
                <span className='block text-slate-700 rounded px-3 py-2 hover:bg-slate-100'>
                  Action plan
                </span>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className='flex-1 flex flex-col items-center py-10 px-8'>
        <div className='w-full max-w-5xl'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold'>Engagement overview</h1>
              <div className='text-slate-400 text-xs mt-1 flex gap-4'>
                <span>a month ago</span>
                <span>•</span>
                <span>a month ago</span>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' className='text-xs'>
                NPS
              </Button>
              <Button variant='outline' className='text-xs'>
                Average
              </Button>
              <Button variant='outline' className='text-xs'>
                Share
              </Button>
              <Button variant='outline' className='text-xs'>
                Export
              </Button>
            </div>
          </div>
          {/* Summary Cards */}
          <div className='grid grid-cols-4 gap-4 mb-8'>
            {/* Engagement Score */}
            <Card className='col-span-1 flex flex-col items-center justify-center py-6'>
              <CardContent className='flex flex-col items-center'>
                <div className='text-slate-500 text-xs mb-2'>
                  Engagement score
                </div>
                <div className='text-6xl font-bold text-green-700 mb-2'>
                  7.4
                </div>
                <div className='flex items-center gap-2 text-xs text-slate-500'>
                  <span>eNPS Distribution:</span>
                  <span className='text-green-700 font-semibold'>
                    42% Promoters
                  </span>
                  <span className='text-slate-400'>|</span>
                  <span className='text-slate-700'>32% Passives</span>
                  <span className='text-slate-400'>|</span>
                  <span className='text-red-600 font-semibold'>
                    26% Detractors
                  </span>
                </div>
              </CardContent>
            </Card>
            {/* Outcomes */}
            <Card className='col-span-1 flex flex-col justify-center py-6'>
              <CardContent>
                <div className='text-slate-500 text-xs mb-2'>Outcomes</div>
                <div className='text-lg font-bold text-slate-700 mb-1'>
                  0.7 below{' '}
                  <span className='text-slate-400 font-normal'>
                    True Benchmark® 8.1
                  </span>
                </div>
                <div className='text-xs text-slate-500 mb-2'>
                  Room for improvement
                </div>
                <div className='text-xs text-slate-500'>
                  In the bottom 25% of Technology
                </div>
              </CardContent>
            </Card>
            {/* Score over time */}
            <Card className='col-span-1 flex flex-col justify-center py-6'>
              <CardContent>
                <div className='text-slate-500 text-xs mb-2'>
                  Score over time
                </div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs text-slate-500'>
                    No change since 2 Jan
                  </span>
                </div>
                <div className='h-16 flex items-center justify-center'>
                  <svg width='100' height='40'>
                    <polyline
                      points='0,30 20,28 40,28 60,28 80,28 100,28'
                      fill='none'
                      stroke='#94a3b8'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
            {/* Participation */}
            <Card className='col-span-1 flex flex-col justify-center py-6'>
              <CardContent>
                <div className='text-slate-500 text-xs mb-2'>Participation</div>
                <div className='text-lg font-bold text-slate-700 mb-1'>
                  93% aggregated participation rate
                </div>
                <div className='text-xs text-slate-500 mb-2'>
                  3 percentage points above benchmark (90%)
                </div>
                <div className='text-xs text-slate-500'>
                  Engagement score based on 761 employees (out of 828 who
                  received the survey)
                </div>
                <div className='text-xs text-green-700 mt-2'>
                  Aggregate score accuracy: <b>High</b>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Highlighted drivers of engagement */}
          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <div className='font-semibold text-slate-700 mb-2'>
              Highlighted drivers of engagement
            </div>
            <div className='text-slate-500 text-sm mb-2'>
              Drivers measure how satisfied employees are with the culture,
              leadership, and responsibilities that make up their experience at
              work.
            </div>
            <a href='#' className='text-blue-700 text-xs underline'>
              How do we know this?
            </a>
          </div>
          {/* Priorities */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='font-semibold text-slate-700 mb-4'>Priorities</div>
            <div className='space-y-4'>
              {/* Priority 1 */}
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-slate-700'>Strategy</div>
                  <div className='text-xs text-slate-500'>
                    5.9 <span className='text-red-600'>Bottom 5%</span>{' '}
                    <span className='ml-2 text-slate-400'>
                      1.9 below True Benchmark 7.8
                    </span>
                  </div>
                  <div className='text-xs text-slate-500 mt-1'>
                    Improve driver score by creating an action plan
                  </div>
                </div>
                <Button variant='outline' className='text-xs'>
                  Take action
                </Button>
              </div>
              {/* Priority 2 */}
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-slate-700'>Workload</div>
                  <div className='text-xs text-slate-500'>
                    5.8 <span className='text-red-600'>Bottom 5%</span>{' '}
                    <span className='ml-2 text-slate-400'>
                      2.6 below True Benchmark 7.6
                    </span>
                  </div>
                  <div className='text-xs text-slate-500 mt-1'>
                    Improve driver score by creating an action plan
                  </div>
                </div>
                <Button variant='outline' className='text-xs'>
                  Take action
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
