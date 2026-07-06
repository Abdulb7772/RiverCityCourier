import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { SavedLocationsScreen } from '@/components/customer/SavedLocationsScreen';

export default async function SavedLocationsPage() {
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

  return <SavedLocationsScreen userEmail={session.user.email} userName={session.user.name} />;
}
