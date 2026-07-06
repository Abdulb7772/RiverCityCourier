import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { ReviewsScreen } from '@/components/admin/reviews/ReviewsScreen';

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <ReviewsScreen userEmail={session.user.email} userName={session.user.name} />;
}
