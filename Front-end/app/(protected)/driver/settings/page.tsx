import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverSettingsClient } from '@/components/driver/DriverSettingsClient';

export default async function DriverSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  if (session.user.role !== 'driver') redirect('/dashboard');

  return (
    <DriverSettingsClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
