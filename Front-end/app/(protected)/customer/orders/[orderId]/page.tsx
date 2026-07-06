import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerOrderDetail } from '@/components/customer/CustomerOrderDetail';

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerOrderDetailPage({ params }: Props) {
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

  const { orderId } = await params;

  return (
    <CustomerOrderDetail
      orderId={orderId}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}