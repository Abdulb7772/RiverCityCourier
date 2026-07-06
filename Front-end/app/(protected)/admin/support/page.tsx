import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { AdminSupportClient } from './AdminSupportClient';

export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'customer') {
    redirect('/customer');
  }

  if (session.user.role === 'driver') {
    redirect('/driver');
  }

  return <AdminSupportClient userEmail={session.user.email} userName={session.user.name} />;
}
