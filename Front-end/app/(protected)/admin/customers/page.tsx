import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomersScreen } from '@/components/admin/customers/CustomersScreen';

type CustomersPageProps = {
  searchParams?: Promise<{ entry?: string | string[] }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <CustomersScreen userEmail={session.user.email} userName={session.user.name} />;
}
