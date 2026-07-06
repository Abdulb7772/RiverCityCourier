import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerProfileScreen } from '@/components/customer/CustomerProfileScreen';

export default async function CustomerProfilePage() {
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

  return <CustomerProfileScreen userEmail={session.user.email} userName={session.user.name} />;
}
