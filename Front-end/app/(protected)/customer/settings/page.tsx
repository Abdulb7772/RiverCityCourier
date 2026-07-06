import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerSettingsScreen } from '@/components/customer/CustomerSettingsScreen';

export default async function CustomerSettingsPage() {
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

  return <CustomerSettingsScreen userEmail={session.user.email} userName={session.user.name} />;
}
