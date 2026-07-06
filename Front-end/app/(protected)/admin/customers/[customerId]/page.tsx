import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { CustomerDetailsScreen } from '@/components/admin/customers/CustomerDetailsScreen';

type Props = {
  params: Promise<{ customerId: string }>;
};

export default async function CustomerDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { customerId } = await params;

  return <CustomerDetailsScreen userEmail={session.user.email} userName={session.user.name} customerId={customerId} />;
}
