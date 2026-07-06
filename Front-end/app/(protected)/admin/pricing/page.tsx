import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { PricingScreen } from '@/components/admin/pricing/PricingScreen';

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <PricingScreen userEmail={session.user.email} userName={session.user.name} />;
}
