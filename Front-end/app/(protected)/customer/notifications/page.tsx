import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { NotificationsPage } from '@/components/notifications/NotificationsPage';

export default async function CustomerNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  if (session.user.role === 'driver') {
    redirect('/driver');
  }

  return (
    <NotificationsPage
      role="customer"
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
