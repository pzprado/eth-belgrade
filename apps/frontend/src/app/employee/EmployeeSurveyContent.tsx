'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { protectSurveyData } from '@/lib/iexec';
// import { useUser } from '@civic/auth-web3/react'; // Remove unused
import { Calendar, ShieldCheck, Clock } from 'lucide-react';

// Add the global question set (normally imported from a shared config)
const SUM_GLOBAL_QUESTIONS = [
  {
    questionId: 'core_advocacy',
    text: 'How likely is it you would recommend [Our Company] as a place to work?',
    type: 'rating_1_5',
    category: 'Core Engagement',
  },
  {
    questionId: 'core_loyalty',
    text: 'How likely is it that you would stay with [Our Company] if you were offered a similar role at another organization?',
    type: 'rating_1_5',
    category: 'Core Engagement',
  },
  {
    questionId: 'core_satisfaction',
    text: 'Overall, how satisfied are you working for [Our Company]?',
    type: 'rating_1_5',
    category: 'Core Engagement',
  },
  {
    questionId: 'driver_accomplishment',
    text: 'Most days I feel a sense of accomplishment from what I do.',
    type: 'rating_1_5',
    category: 'Accomplishment',
  },
  {
    questionId: 'driver_autonomy',
    text: "I'm given enough freedom to decide how to do my work.",
    type: 'rating_1_5',
    category: 'Autonomy',
  },
  {
    questionId: 'driver_growth_main',
    text: "I feel that I'm growing professionally at [Our Company].",
    type: 'rating_1_5',
    category: 'Growth',
  },
  {
    questionId: 'driver_growth_learning',
    text: 'My role at [Our Company] enables me to learn and develop new skills.',
    type: 'rating_1_5',
    category: 'Growth',
  },
  {
    questionId: 'driver_managementsupport_main',
    text: 'My manager provides me with the support I need to complete my work.',
    type: 'rating_1_5',
    category: 'Management Support',
  },
  {
    questionId: 'driver_managementsupport_caring',
    text: 'My manager cares about me as a person.',
    type: 'rating_1_5',
    category: 'Management Support',
  },
  {
    questionId: 'driver_meaningfulwork_main',
    text: 'The work I do at [Our Company] is meaningful to me.',
    type: 'rating_1_5',
    category: 'Meaningful Work',
  },
  {
    questionId: 'driver_workload_main',
    text: 'The demands of my workload are manageable.',
    type: 'rating_1_5',
    category: 'Workload',
  },
  {
    questionId: 'open_comment',
    text: 'Any additional comments or suggestions? (Optional)',
    type: 'text',
    category: 'Open Feedback',
  },
];

// New form state: answers keyed by questionId
const initialAnswers = Object.fromEntries(
  SUM_GLOBAL_QUESTIONS.map((q) => [q.questionId, q.type === 'text' ? '' : null])
);

const SURVEY_PROJECT_ID = 'sum_alpha';

export function EmployeeSurveyContent() {
  // const { user } = useUser(); // Remove if not used
  const [answers, setAnswers] = useState<{
    [key: string]: number | string | null;
  }>(initialAnswers);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRatingClick = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};
    for (const q of SUM_GLOBAL_QUESTIONS) {
      if (
        q.type === 'rating_1_5' &&
        (answers[q.questionId] === null || answers[q.questionId] === undefined)
      ) {
        newErrors[q.questionId] = true;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccess(false);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const responses = SUM_GLOBAL_QUESTIONS.map((q) => ({
        questionId: q.questionId,
        answerValue: answers[q.questionId],
      }));
      const protectedData = await protectSurveyData({ responses });
      const res = await fetch('/api/submitSurvey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...protectedData,
          surveyProjectId: SURVEY_PROJECT_ID,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit survey');
      }
      setSuccess(true);
      setAnswers(initialAnswers);
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Error submitting survey. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingButtons = (
    questionId: string,
    selectedValue: number | null
  ) => (
    <div className='flex gap-3 flex-wrap mt-2'>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <Button
          key={rating}
          variant={selectedValue === rating ? 'default' : 'outline'}
          className={`w-12 h-12 p-0 rounded-md text-lg font-semibold
            ${
              selectedValue === rating
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }
            ${errors[questionId] ? 'border-destructive' : ''}`}
          onClick={() => handleRatingClick(questionId, rating)}
          type='button'
        >
          {rating}
        </Button>
      ))}
    </div>
  );

  return (
    <div className='w-full max-w-2xl flex flex-col gap-6'>
      {/* Top intro card */}
      <Card className='mb-2 mt-4'>
        <CardContent className='py-6 '>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-4xl font-bold'>Satisfaction Survey</span>
              <span className='text-slate-600 text-sm'>
                Your feedback helps us create a better workplace. This survey is
                encrypted, anonymous and takes about 5 minutes to complete.
              </span>
              <span className='text-xs text-blue-700 mt-2'>
                Active Project ID: <b>{SURVEY_PROJECT_ID}</b>
              </span>
            </div>
            <span className='bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full'>
              Active
            </span>
          </div>
          <div className='flex items-center gap-6 mt-3'>
            <span className='flex items-center gap-1 text-slate-500 text-sm'>
              <Clock className='w-4 h-4' /> 5 minutes
            </span>
            <span className='flex items-center gap-1 text-slate-500 text-sm'>
              <ShieldCheck className='w-4 h-4' /> 100% Anonymous
            </span>
            <span className='flex items-center gap-1 text-slate-500 text-sm'>
              <Calendar className='w-4 h-4' /> Due:{' '}
              {new Date(
                new Date().setDate(new Date().getDate() + 7)
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Survey questions card */}
      <Card>
        <CardHeader>{/* No title/desc for redundancy */}</CardHeader>
        <CardContent className='flex flex-col gap-8'>
          {SUM_GLOBAL_QUESTIONS.map((q) => (
            <div className='mb-6' key={q.questionId}>
              <label className='text-xl font-semibold'>
                {q.text.replace('[Our Company]', 'Sum')}
                {q.type === 'rating_1_5' && (
                  <span className='text-destructive'>*</span>
                )}
              </label>
              {q.type === 'rating_1_5' ? (
                renderRatingButtons(
                  q.questionId,
                  answers[q.questionId] as number | null
                )
              ) : (
                <Textarea
                  placeholder='Share your 100% anonymous thoughts...'
                  className='min-h-[100px] mt-2 text-base'
                  value={answers[q.questionId] as string}
                  onChange={(e) =>
                    handleTextChange(q.questionId, e.target.value)
                  }
                />
              )}
              {errors[q.questionId] && (
                <p className='text-sm text-destructive mt-1'>
                  Please answer this question
                </p>
              )}
            </div>
          ))}

          <Button
            className='w-full mt-2'
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
          {success && (
            <div className='rounded bg-green-100 text-green-800 px-4 py-2 mt-2'>
              Survey submitted successfully!
            </div>
          )}
          {errorMsg && (
            <div className='rounded bg-red-100 text-red-800 px-4 py-2 mt-2'>
              {errorMsg}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
