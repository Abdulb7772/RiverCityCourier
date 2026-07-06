import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverDetailsScreen } from '@/components/admin/drivers/DriverDetailsScreen';

export default async function DriverDetailsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <DriverDetailsScreen userEmail={session.user.email} userName={session.user.name} />;
}
