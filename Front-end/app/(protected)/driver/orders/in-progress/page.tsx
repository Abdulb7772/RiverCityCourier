import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverInProgressClient } from '@/components/driver/DriverInProgressClient';

export default async function DriverInProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return (
    <DriverInProgressClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
