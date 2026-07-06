import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverProfileClient } from '@/components/driver/DriverProfileClient';

export default async function DriverProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  if (session.user.role !== 'driver') redirect('/dashboard');

  return (
    <DriverProfileClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
