'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { protectSurveyData } from '@/lib/iexec';
import { User } from '@civic/auth';
import { Calendar, ShieldCheck, Clock } from 'lucide-react';

interface SurveyData {
  workload: number | null;
  managerSupport: number | null;
  companyAlignment: number | null;
  comments: string;
}

export function EmployeeSurveyContent({ user }: { user: User }) {
  const [formData, setFormData] = useState<SurveyData>({
    workload: null,
    managerSupport: null,
    companyAlignment: null,
    comments: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SurveyData, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRatingClick = (field: keyof SurveyData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SurveyData, boolean>> = {};
    if (formData.workload === null) newErrors.workload = true;
    if (formData.managerSupport === null) newErrors.managerSupport = true;
    if (formData.companyAlignment === null) newErrors.companyAlignment = true;
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
      const protectedData = await protectSurveyData(formData);
      const res = await fetch('/api/submitSurvey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protectedData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit survey');
      }
      setSuccess(true);
      setFormData({
        workload: null,
        managerSupport: null,
        companyAlignment: null,
        comments: '',
      });
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
    field: keyof SurveyData,
    selectedValue: number | null
  ) => (
    <div className='flex gap-2 flex-wrap'>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <Button
          key={rating}
          variant={selectedValue === rating ? 'default' : 'outline'}
          className={`w-10 h-10 p-0 rounded-md text-base font-semibold
            ${
              selectedValue === rating
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }
            ${errors[field] ? 'border-destructive' : ''}`}
          onClick={() => handleRatingClick(field, rating)}
          type='button'
        >
          {rating}
        </Button>
      ))}
    </div>
  );

  const firstName =
    user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Employee';

  return (
    <div className='w-full max-w-2xl flex flex-col gap-6'>
      {/* Top intro card */}
      <Card className='mb-2'>
        <CardContent className='py-6'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-lg font-bold'>
                Employee Satisfaction Survey
              </span>
              <span className='text-slate-600 text-sm'>
                Your feedback helps us create a better workplace. This survey is
                encrypted, anonymous and takes about 5 minutes to complete.
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
        <CardHeader>
          {/* Removed CardTitle and CardDescription to avoid redundancy */}
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How manageable is your current workload?
              <span className='text-destructive'>*</span>
            </label>
            {renderRatingButtons('workload', formData.workload)}
            {errors.workload && (
              <p className='text-sm text-destructive'>Please select a rating</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How supported do you feel by your direct manager?
              <span className='text-destructive'>*</span>
            </label>
            {renderRatingButtons('managerSupport', formData.managerSupport)}
            {errors.managerSupport && (
              <p className='text-sm text-destructive'>Please select a rating</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How well do you feel aligned with the company&apos;s goals?
              <span className='text-destructive'>*</span>
            </label>
            {renderRatingButtons('companyAlignment', formData.companyAlignment)}
            {errors.companyAlignment && (
              <p className='text-sm text-destructive'>Please select a rating</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Any additional comments or suggestions?
            </label>
            <Textarea
              placeholder='Share your thoughts...'
              className='min-h-[100px]'
              value={formData.comments}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comments: e.target.value }))
              }
            />
          </div>

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
