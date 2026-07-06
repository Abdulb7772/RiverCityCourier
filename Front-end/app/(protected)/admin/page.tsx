import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

type AdminPageProps = {
  searchParams?: Promise<{
    entry?: string | string[];
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const entry = Array.isArray(resolvedSearchParams?.entry)
    ? resolvedSearchParams.entry[0]
    : resolvedSearchParams?.entry ?? null;

  if (session.user.role !== 'admin') {
    const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

    redirect(`/dashboard${entrySuffix}`);
  }

  return (
    <AdminDashboard
      userEmail={session.user.email}
      userName={session.user.name}
      entrySource={entry === 'login' ? 'login' : null}
    />
  );
}