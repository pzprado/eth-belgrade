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
import { Smile, Meh, Frown, TrendingUp, Users, BarChart } from 'lucide-react';

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
            <Card className='col-span-1 min-h-[160px] flex flex-col justify-between p-4'>
              <CardContent className='flex flex-col h-full p-0 w-full'>
                <div className='w-full text-left text-slate-500 text-xs mb-2'>
                  Engagement score
                </div>
                <div className='flex flex-col items-center justify-center flex-1 w-full'>
                  <div className='text-5xl font-bold text-green-700 mb-2 text-center'>
                    7.4
                  </div>
                  <div className='flex flex-col items-start gap-y-1 text-xs mt-1 w-full'>
                    <span className='text-slate-500 mb-1'>
                      eNPS Distribution:
                    </span>
                    <span className='flex items-center gap-1 text-green-700 font-semibold'>
                      <Smile className='w-4 h-4 text-green-700' /> 42% Promoters
                    </span>
                    <span className='flex items-center gap-1 text-slate-700'>
                      <Meh className='w-4 h-4 text-slate-500' /> 32% Passives
                    </span>
                    <span className='flex items-center gap-1 text-red-600 font-semibold'>
                      <Frown className='w-4 h-4 text-red-600' /> 26% Detractors
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Outcomes */}
            <Card className='col-span-1 min-h-[160px] flex flex-col justify-between p-4'>
              <CardContent className='flex flex-col h-full p-0 w-full'>
                <div className='w-full text-left text-slate-500 text-xs mb-2'>
                  Outcomes
                </div>
                <div className='flex flex-col items-center justify-center flex-1 w-full'>
                  <span className='text-lg font-bold text-slate-700 mb-1'>
                    <span className='font-bold'>0.7 below</span>{' '}
                    <span className='text-slate-400 font-normal'>
                      True Benchmark® 8.1
                    </span>
                  </span>
                  <span className='text-xs text-slate-500 mb-1'>
                    Room for improvement
                  </span>
                  <span className='text-xs text-slate-500'>
                    In the bottom 25% of Technology
                  </span>
                </div>
              </CardContent>
            </Card>
            {/* Score over time */}
            <Card className='col-span-1 min-h-[160px] flex flex-col justify-between p-4'>
              <CardContent className='flex flex-col h-full p-0 w-full'>
                <div className='w-full text-left text-slate-500 text-xs mb-2'>
                  Score over time
                </div>
                <div className='flex flex-col items-center justify-center flex-1 w-full'>
                  <span className='text-xs text-slate-500 mb-2'>
                    No change since 2 Jan
                  </span>
                  <div className='h-10 flex items-center justify-center'>
                    <svg width='80' height='24'>
                      <polyline
                        points='0,18 16,16 32,16 48,16 64,16 80,16'
                        fill='none'
                        stroke='#94a3b8'
                        strokeWidth='2'
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Participation */}
            <Card className='col-span-1 min-h-[160px] flex flex-col justify-between p-4'>
              <CardContent className='flex flex-col h-full p-0 w-full'>
                <div className='w-full text-left text-slate-500 text-xs mb-2'>
                  Participation
                </div>
                <div className='flex flex-col items-center justify-center flex-1 w-full'>
                  <span className='text-base font-bold text-slate-800 mb-1'>
                    93% aggregated participation rate
                  </span>
                  <span className='text-xs text-slate-500 mb-1'>
                    3 percentage points above benchmark (90%)
                  </span>
                  <span className='text-xs text-slate-500'>
                    Engagement score based on 761 employees (out of 828 who
                    received the survey)
                  </span>
                  <span className='text-xs text-green-700 mt-1'>
                    Aggregate score accuracy: <b>High</b>
                  </span>
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
