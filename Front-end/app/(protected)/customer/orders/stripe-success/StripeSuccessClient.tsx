'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { confirmPayment } from '@/lib/stripe';

type Props = {
  sessionId?: string;
};

export function StripeSuccessClient({ sessionId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    confirmPayment(sessionId)
      .then((order: { id: string; orderNumber: string }) => {
        setOrderId(order.orderNumber || `#${order.id.slice(-6)}`);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <div className="relative z-10 mx-auto w-full max-w-lg px-6">
        {status === 'loading' && (
          <div className="border border-orange-900/40 bg-slate-950/60 p-10 text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <h1 className="text-xl font-bold text-white">Confirming Payment...</h1>
            <p className="mt-2 text-sm text-orange-100/60">Please wait while we verify your payment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="border border-emerald-500/40 bg-slate-950/60 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-8 w-8 text-emerald-400">
                <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-emerald-200">Payment Successful!</h1>
            <p className="mt-3 text-sm text-orange-100/60">
              Your order has been placed and payment confirmed. Order #{orderId.slice(-6)}.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href={`/customer/orders/${orderId}`}
                className="border border-orange-900/40 bg-orange-950/30 px-6 py-3 text-sm text-orange-200 transition hover:border-orange-500/40 hover:bg-orange-950/50"
              >
                View Order
              </Link>
              <Link
                href="/customer/orders"
                className="border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
              >
                My Orders
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="border border-rose-500/40 bg-slate-950/60 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-8 w-8 text-rose-400">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-rose-200">Payment Confirmation Failed</h1>
            <p className="mt-3 text-sm text-orange-100/60">
              We could not confirm your payment. Please check your orders or contact support.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/customer/orders"
                className="border border-orange-900/40 bg-orange-950/30 px-6 py-3 text-sm text-orange-200 transition hover:border-orange-500/40 hover:bg-orange-950/50"
              >
                My Orders
              </Link>
              <button
                type="button"
                onClick={() => router.push('/customer/create-delivery')}
                className="border border-orange-900/40 bg-orange-950/30 px-6 py-3 text-sm text-orange-200 transition hover:border-orange-500/40 hover:bg-orange-950/50"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}