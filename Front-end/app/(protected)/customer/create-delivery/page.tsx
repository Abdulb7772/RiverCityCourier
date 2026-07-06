import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerCreateDelivery } from '@/components/customer/CustomerCreateDelivery';

export default async function CreateDeliveryPage() {
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
    <CustomerCreateDelivery
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}