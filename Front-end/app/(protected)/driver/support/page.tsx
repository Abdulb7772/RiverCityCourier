import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverSupportClient } from './DriverSupportClient';

export default async function DriverSupportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  if (session.user.role === 'customer') {
    redirect('/customer');
  }

  return <DriverSupportClient userEmail={session.user.email} userName={session.user.name} />;
}
