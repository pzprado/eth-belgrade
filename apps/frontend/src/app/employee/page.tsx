import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EmployeePage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle>Employee Pulse Survey</CardTitle>
          <CardDescription>
            Your responses are encrypted and anonymous. Be honest and help us
            improve.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How manageable is your current workload?
              <span className='text-destructive'>*</span>
            </label>
            <div className='flex gap-4'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant='outline'
                  className='flex-1 hover:bg-primary hover:text-primary-foreground'
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How supported do you feel by your direct manager?
              <span className='text-destructive'>*</span>
            </label>
            <div className='flex gap-4'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant='outline'
                  className='flex-1 hover:bg-primary hover:text-primary-foreground'
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              How well do you feel aligned with the company's goals?
              <span className='text-destructive'>*</span>
            </label>
            <div className='flex gap-4'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant='outline'
                  className='flex-1 hover:bg-primary hover:text-primary-foreground'
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Any additional comments or suggestions?
            </label>
            <Textarea
              placeholder='Share your thoughts...'
              className='min-h-[100px]'
            />
          </div>

          <Button className='w-full'>Submit Survey</Button>
        </CardContent>
      </Card>
    </div>
  );
}
