'use client';

import { UserButton, useUser } from '@civic/auth-web3/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeSurveyContent } from './employee/EmployeeSurveyContent';

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Sign in to Sum</CardTitle>
          </CardHeader>
          <CardContent>
            <UserButton />
            <p className='mt-4 text-sm text-muted-foreground'>
              Sign in with Civic to access the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: show employee survey UI with navigation
  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <main className='flex flex-col items-center justify-center flex-1'>
        <EmployeeSurveyContent />
      </main>
    </div>
  );
}
