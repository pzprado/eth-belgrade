'use client';
import { useUser, UserButton } from '@civic/auth/react';

export default function Navbar() {
  const { user } = useUser();
  const firstName =
    user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Employee';

  return (
    <nav className='w-full flex items-center justify-between px-6 py-3 border-b bg-white/80 backdrop-blur z-20 sticky top-0'>
      <div className='flex items-center gap-3'>
        <img src='/logo.svg' alt='Sum Logo' className='h-8 w-8' />
        <span
          className='text-xl font-bold tracking-tight'
          style={{ color: '#7A2BE1' }}
        >
          sum
        </span>
      </div>
      {user && (
        <div className='flex items-center gap-4'>
          <span className='text-base text-slate-700'>Welcome back</span>
          <UserButton />
        </div>
      )}
    </nav>
  );
}
