import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { SettingsScreen } from '@/components/admin/settings/SettingsScreen';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <SettingsScreen userEmail={session.user.email} userName={session.user.name} />;
}
