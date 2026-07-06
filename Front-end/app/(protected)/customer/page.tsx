import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

type CustomerPageProps = {
  searchParams?: Promise<{
    entry?: string | string[];
  }>;
};

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'admin') {
    const resolvedSearchParams = await searchParams;
    const entry = Array.isArray(resolvedSearchParams?.entry)
      ? resolvedSearchParams.entry[0]
      : resolvedSearchParams?.entry;

    const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

    redirect(`/admin${entrySuffix}`);
  }

  if (session.user.role === 'driver') {
    const resolvedSearchParams = await searchParams;
    const entry = Array.isArray(resolvedSearchParams?.entry)
      ? resolvedSearchParams.entry[0]
      : resolvedSearchParams?.entry;

    const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

    redirect(`/driver${entrySuffix}`);
  }

  const resolvedSearchParams = await searchParams;
  const entry = Array.isArray(resolvedSearchParams?.entry)
    ? resolvedSearchParams.entry[0]
    : resolvedSearchParams?.entry;

  const entrySuffix = entry ? `?entry=${encodeURIComponent(entry)}` : '';

  redirect(`/dashboard${entrySuffix}`);
}