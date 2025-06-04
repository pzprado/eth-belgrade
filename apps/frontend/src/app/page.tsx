'use client';

import { UserButton, useUser } from '@civic/auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { EmployeeSurveyContent } from './employee/EmployeeSurveyContent';
import { User } from '@civic/auth';
import { UserCircle2 } from 'lucide-react';
import AdminPage from './admin/page';

function NavigationBar({
  user,
  onAdminClick,
}: {
  user: User;
  onAdminClick: () => void;
}) {
  return (
    <nav className='flex items-center justify-between w-full max-w-2xl mx-auto py-4 px-2'>
      <div className='flex items-center gap-2'>
        <UserCircle2 className='w-7 h-7 text-sky-600' />
        <span className='font-semibold text-base'>
          {user.name || user.email || 'Employee'}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          onClick={onAdminClick}
          title='Admin/Project Management'
        >
          <span role='img' aria-label='admin'>
            🛠️
          </span>
        </Button>
        <UserButton />
      </div>
    </nav>
  );
}

export default function Home() {
  const { user, isLoading } = useUser();
  const [showAdmin, setShowAdmin] = useState(false);

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

  // If user clicks admin icon, show admin/project management UI
  if (showAdmin) {
    return (
      <div className='flex flex-col min-h-screen bg-slate-50'>
        <NavigationBar user={user} onAdminClick={() => setShowAdmin(false)} />
        <main className='flex flex-col items-center justify-center flex-1'>
          <AdminPage />
        </main>
      </div>
    );
  }

  // Default: show employee survey UI with navigation
  return (
    <div className='flex flex-col min-h-screen bg-slate-50'>
      <NavigationBar user={user} onAdminClick={() => setShowAdmin(true)} />
      <main className='flex flex-col items-center justify-center flex-1'>
        <EmployeeSurveyContent />
      </main>
    </div>
  );
}
