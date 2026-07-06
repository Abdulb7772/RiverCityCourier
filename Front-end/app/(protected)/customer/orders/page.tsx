import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerActiveDeliveries } from '@/components/customer/CustomerActiveDeliveries';

export default async function CustomerOrdersPage() {
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
    <CustomerActiveDeliveries
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}