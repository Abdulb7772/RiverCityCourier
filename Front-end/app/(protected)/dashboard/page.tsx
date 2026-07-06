import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';

type DashboardPageProps = {
  searchParams?: Promise<{
    entry?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const entry = Array.isArray(resolvedSearchParams?.entry)
    ? resolvedSearchParams.entry[0]
    : resolvedSearchParams?.entry ?? null;

  if (session.user.role === 'admin') {
    const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

    redirect(`/admin${entrySuffix}`);
  }

  if (session.user.role === 'driver') {
    const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

    redirect(`/driver${entrySuffix}`);
  }

  return (
    <CustomerDashboard
      userEmail={session.user.email}
      userName={session.user.name}
      entrySource={entry === 'signup' ? 'signup' : entry === 'login' ? 'login' : null}
    />
  );
}