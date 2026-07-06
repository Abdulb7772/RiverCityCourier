'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCompletedOrders, type DriverOrder } from '@/lib/driver-orders';

type Props = {
  userEmail: string;
};

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoSymbolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8l8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function DriverCompletedOrders({ userEmail }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchCompletedOrders(userEmail)
      .then((res) => setOrders(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-white/60">Loading completed orders...</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-sm text-rose-400">{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-900/30 bg-orange-950/30 mb-4">
          <NoSymbolIcon />
        </span>
        <p className="text-sm font-medium text-white">No completed orders</p>
        <p className="mt-1 text-xs text-orange-300/50">Completed orders will appear here once deliveries are finished.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const hasPhotos = order.pickupPhotos.length > 0 || order.deliveryPhoto;
        return (
          <button
            key={order.id}
            type="button"
            onClick={() => router.push(`/driver/orders/completed/${order.id}`)}
            className="w-full rounded-lg border border-orange-900/30 bg-slate-950/50 px-5 py-4 text-left transition hover:border-orange-500/40 hover:bg-slate-950/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{order.customer}</p>
                <p className="mt-0.5 text-xs text-orange-300/60 truncate">{order.pickup} &rarr; {order.destination}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-orange-300/40">
                  <span>{order.packageType}</span>
                  <span>{order.distance}</span>
                  <span className="text-emerald-400/60">{order.eta}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {hasPhotos && (
                  <span className="flex items-center gap-1.5 rounded-md border border-orange-800/30 bg-orange-950/30 px-2.5 py-1.5 text-[0.65rem] text-orange-300/60">
                    <ImageIcon />
                    {order.pickupPhotos.length + (order.deliveryPhoto ? 1 : 0)}
                  </span>
                )}
                <ChevronRightIcon />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
