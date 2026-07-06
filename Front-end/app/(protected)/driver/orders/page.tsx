import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverOrdersClient } from '@/components/driver/DriverOrdersClient';

export default async function DriverOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return <DriverOrdersClient userEmail={session.user.email} userName={session.user.name} />;
}
