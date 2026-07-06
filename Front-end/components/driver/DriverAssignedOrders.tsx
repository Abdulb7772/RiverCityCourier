'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAssignedOrders, type DriverOrder } from '@/lib/driver-orders';

const statusStyles: Record<string, string> = {
  accepted:              'border-sky-500/40 bg-sky-500/10 text-sky-300',
  arrived_at_pickup:     'border-amber-500/40 bg-amber-500/10 text-amber-300',
  picked_up:             'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  in_transit:            'border-violet-500/40 bg-violet-500/10 text-violet-300',
  arrived_at_destination:'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  completed:             'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

const statusLabel: Record<string, string> = {
  accepted: 'Pending',
  arrived_at_pickup: 'In Progress',
  picked_up: 'In Progress',
  in_transit: 'In Progress',
  completed: 'Completed',
};

const priorityStyles: Record<string, string> = {
  high:   'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low:    'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

type Props = {
  userEmail?: string | null;
};

export function DriverAssignedOrders({ userEmail }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback((p: number) => {
    if (!userEmail) return;
    setLoading(true);
    fetchAssignedOrders(userEmail, p, 10)
      .then((r) => {
        setOrders(r.data);
        setTotalPages(r.totalPages);
        setTotal(r.total);
      })
      .catch(() => { setOrders([]); setTotalPages(1); setTotal(0); })
      .finally(() => setLoading(false));
  }, [userEmail]);

  useEffect(() => { load(page); }, [page, load]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Assigned Orders</h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/60">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Assigned Orders</h1>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 py-16">
          <p className="text-sm text-white/60">No orders assigned to you yet.</p>
        </div>
      </div>
    );
  }

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const visiblePages = pageNumbers.slice(
    Math.max(0, Math.min(page - 3, totalPages - 5)),
    Math.min(totalPages, Math.max(page + 2, 5)),
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Assigned Orders</h1>
          <p className="mt-1 text-xs text-white/50">{total} order{total !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-orange-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-orange-900/30 bg-orange-950/30 text-left">
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Order #</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Pickup</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Destination</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Customer</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Contact</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Shipment</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Priority</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">ETA</th>
              <th className="px-4 py-3.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/70">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-900/20">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => router.push(`/driver/orders/${o.id}`)}
                className="cursor-pointer bg-slate-950/40 transition hover:bg-orange-950/30"
              >
                <td className="px-4 py-3.5 font-mono text-xs text-white">
                  #{o.orderNumber}
                </td>
                <td className="max-w-40 truncate px-4 py-3.5 text-white/80" title={o.pickup}>
                  {o.pickup}
                </td>
                <td className="max-w-40 truncate px-4 py-3.5 text-white/80" title={o.destination}>
                  {o.destination}
                </td>
                <td className="px-4 py-3.5 font-medium text-white">
                  {o.customer}
                </td>
                <td className="px-4 py-3.5 text-white/70">
                  {o.contact || '\u2014'}
                </td>
                <td className="max-w-40 truncate px-4 py-3.5 text-white/70" title={`${o.packageType || ''}${o.note ? ` - ${o.note}` : ''}`}>
                  {o.packageType || '\u2014'}{o.note ? ` - ${o.note.slice(0, 30)}${o.note.length > 30 ? '...' : ''}` : ''}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block border px-2 py-0.5 text-[0.6rem] font-semibold ${priorityStyles[o.priority?.toLowerCase()] || 'border-white/20 bg-white/10 text-white/70'}`}>
                    {o.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-white/70">
                  {o.eta || '\u2014'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block border px-2 py-0.5 text-[0.6rem] font-semibold ${statusStyles[o.status] || 'border-white/20 bg-white/10 text-white/70'}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-orange-800/40 bg-orange-950/30 px-3 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:bg-orange-950/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {visiblePages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`min-w-9 border px-3 py-2 text-xs transition ${
                p === page
                  ? 'border-orange-500/50 bg-orange-500/15 text-white'
                  : 'border-orange-800/40 bg-orange-950/30 text-orange-300/70 hover:border-orange-500/40 hover:bg-orange-950/50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border border-orange-800/40 bg-orange-950/30 px-3 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:bg-orange-950/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <span className="ml-2 text-xs text-white/40">
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
