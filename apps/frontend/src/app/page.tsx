import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle className='text-2xl'>
            Sum - Anonymous Employee Pulse Surveys
          </CardTitle>
          <CardDescription>
            Provide honest feedback with guaranteed anonymity through secure
            blockchain technology.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Link href='/employee'>
            <Button className='w-full' variant='default'>
              Employee Portal
            </Button>
          </Link>
          <Link href='/admin'>
            <Button className='w-full' variant='outline'>
              HR Admin Portal
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
