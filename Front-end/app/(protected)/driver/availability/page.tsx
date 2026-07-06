import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverAvailabilityClient } from '@/components/driver/DriverAvailabilityClient';

export default async function DriverAvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  if (session.user.role !== 'driver') redirect('/dashboard');

  return (
    <DriverAvailabilityClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
