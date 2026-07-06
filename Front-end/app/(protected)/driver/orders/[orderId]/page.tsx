import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverOrderDetailClient } from '@/components/driver/DriverOrderDetailClient';

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function DriverOrderDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  const { orderId } = await params;

  return (
    <DriverOrderDetailClient
      orderId={orderId}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
