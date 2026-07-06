import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DeliveryHistoryScreen } from '@/components/customer/DeliveryHistoryScreen';

export default async function CustomerHistoryPage() {
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
    <DeliveryHistoryScreen
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}