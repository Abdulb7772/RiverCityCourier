import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { DriversScreen } from '@/components/admin/drivers/DriversScreen';

type DriversPageProps = {
  searchParams?: Promise<{
    entry?: string | string[];
  }>;
};

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <DriversScreen userEmail={session.user.email} userName={session.user.name} />;
}
