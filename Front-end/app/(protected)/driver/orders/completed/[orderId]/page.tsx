import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriverCompletedDetailClient } from '@/components/driver/DriverCompletedDetailClient';

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function DriverCompletedDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { orderId } = await params;

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'driver') {
    redirect('/dashboard');
  }

  return (
    <DriverCompletedDetailClient
      orderId={orderId}
      userEmail={session.user.email ?? ''}
      userName={session.user.name}
    />
  );
}
