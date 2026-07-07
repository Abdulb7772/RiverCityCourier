import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';

export default async function DriverNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return (
    <NotificationsPage
      role="driver"
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
