import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { OrderDetailsScreen } from '@/components/admin/orders/OrderDetailsScreen';

export default async function OrderDetailsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <OrderDetailsScreen />;
}
