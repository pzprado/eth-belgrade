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

interface SurveyData {
  workload: number | null;
  managerSupport: number | null;
  companyAlignment: number | null;
  comments: string;
}

export function EmployeeSurveyContent() {
  const [formData, setFormData] = useState<SurveyData>({
    workload: null,
    managerSupport: null,
    companyAlignment: null,
    comments: '',
  });
  const [errors, setErrors] = useState<{ [K in keyof SurveyData]?: boolean }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRatingClick = (field: keyof SurveyData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof SurveyData]?: boolean } = {};
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
    } catch (error: any) {
      setErrorMsg(
        error.message || 'Error submitting survey. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingButtons = (
    field: keyof SurveyData,
    selectedValue: number | null
  ) => (
    <div className='flex gap-4'>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Button
          key={rating}
          variant={selectedValue === rating ? 'default' : 'outline'}
          className={`flex-1 ${
            selectedValue === rating
              ? ''
              : 'hover:bg-primary hover:text-primary-foreground'
          } ${errors[field] ? 'border-destructive' : ''}`}
          onClick={() => handleRatingClick(field, rating)}
          type='button'
        >
          {rating}
        </Button>
      ))}
    </div>
  );

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Employee Pulse Survey</CardTitle>
        <CardDescription>
          Your responses are encrypted and anonymous. Be honest and help us
          improve.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        {success && (
          <div className='rounded bg-green-100 text-green-800 px-4 py-2 mb-2'>
            Survey submitted successfully!
          </div>
        )}
        {errorMsg && (
          <div className='rounded bg-red-100 text-red-800 px-4 py-2 mb-2'>
            {errorMsg}
          </div>
        )}
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
            How well do you feel aligned with the company's goals?
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
          className='w-full'
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </Button>
      </CardContent>
    </Card>
  );
}
