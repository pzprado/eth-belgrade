import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className='w-full'>
            Process Survey Results (Demo, no logic yet)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
