import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverCompletedOrdersClient } from '@/components/driver/DriverCompletedOrdersClient';

export default async function DriverCompletedOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return (
    <DriverCompletedOrdersClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
