import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { ActivityLogScreen } from '@/components/admin/activity/ActivityLogScreen';

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <ActivityLogScreen userEmail={session.user.email} userName={session.user.name} />;
}
