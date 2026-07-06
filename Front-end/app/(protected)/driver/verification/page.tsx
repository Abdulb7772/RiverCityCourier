import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverVerificationClient } from '@/components/driver/DriverVerificationClient';

export default async function DriverVerificationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return (
    <DriverVerificationClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
