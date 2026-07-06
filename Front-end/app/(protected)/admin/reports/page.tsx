import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { ReportsScreen } from '@/components/admin/reports/ReportsScreen';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <ReportsScreen userEmail={session.user.email} userName={session.user.name} />;
}
