import { StripeSuccessClient } from './StripeSuccessClient';

type Props = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function StripeSuccessPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <StripeSuccessClient sessionId={resolvedSearchParams?.session_id} />;
}
