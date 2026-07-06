'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerOrder, CustomerOrderStatus, fetchCustomerOrders } from '@/lib/customer-orders';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

const statusStyles: Record<CustomerOrderStatus, string> = {
  new: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  processing: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  picked_up: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
  completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

const statusLabel: Record<CustomerOrderStatus, string> = {
  new: 'New',
  processing: 'Processing',
  picked_up: 'Picked Up',
  completed: 'Completed',
  rejected: 'Cancelled',
};

const progressMap: Record<CustomerOrderStatus, number> = {
  new: 15,
  processing: 40,
  picked_up: 70,
  completed: 100,
  rejected: 0,
};

function TruckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M3.5 7.5h11v8H3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 10.5H18l2.5 2.5V15h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ListIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FlagIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 3v18M5 4h10l-3 4.5L15 13H5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DeliveryHistoryScreen({ userEmail, userName }: Props) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSidebarSelect = (item: string) => {
    setIsSidebarOpen(false);
    if (item === 'Dashboard') { router.push('/dashboard'); return; }
    if (item === 'Create Delivery') { router.push('/customer/create-delivery'); return; }
    if (item === 'Active Deliveries') { router.push('/customer/orders'); return; }
    if (item === 'Delivery History') { router.push('/customer/orders/history'); return; }
    if (item === 'Saved Addresses') { router.push('/customer/saved-locations'); return; }
    if (item === 'Support') { router.push('/customer/support'); return; }
    router.push('/dashboard');
  };

  const handleLogout = () => { window.location.href = '/auth/login'; };

  useEffect(() => {
    if (!userEmail) return;
    fetchCustomerOrders(userEmail!, userName ?? undefined)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [userEmail, userName]);

  const inProgressOrders = useMemo(
    () => orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected'),
    [orders],
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed' || o.status === 'rejected'),
    [orders],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <CustomerNavbar
        userName={userName}
        userEmail={userEmail}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        activeItem="Delivery History"
        onClose={() => setIsSidebarOpen(false)}
        onSelect={handleSidebarSelect}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Customer Orders</p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">Delivery History</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Browse all past and current deliveries. Completed orders remain visible for 60 days before being automatically removed.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'In Progress', value: inProgressOrders.length, color: 'text-amber-300', icon: <TruckIcon className="h-4 w-4" /> },
              { label: 'Completed', value: completedOrders.length, color: 'text-emerald-300', icon: <CheckCircleIcon className="h-4 w-4" /> },
              { label: 'Total', value: orders.length, color: 'text-orange-300', icon: <ListIcon className="h-4 w-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 border border-orange-900/40 bg-orange-950/25 px-5 py-4">
                <span className={`${stat.color} opacity-70`}>{stat.icon}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-orange-400/70">{stat.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders list */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <ListIcon className="h-5 w-5 text-orange-400" />
              All Orders
            </h2>
            <span className="text-xs text-orange-200/50">Click Details to view full order info</span>
          </div>

          {loading ? (
            <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-10 text-center text-sm text-orange-100/60">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-10 text-center text-sm text-orange-100/60">
              No delivery history found. Place a new delivery to get started.
            </div>
          ) : (
            orders.map((order) => {
              const progress = progressMap[order.status];
              return (
                <article key={order.id} className="border border-orange-900/40 bg-slate-950/60 p-5 sm:p-6">

                  {/* Top row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{order.orderNumber}</span>
                      <span className={`border px-2.5 py-0.5 text-[0.7rem] font-semibold ${statusStyles[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                      <span className="border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-slate-300">
                        {order.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 border border-orange-900/30 bg-orange-950/20 px-3 py-1.5 text-xs text-orange-200/70">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '\u2014'}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-orange-400/50 mb-1.5">
                      <span>Order progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-950/60">
                      <div
                        className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex items-start gap-2">
                      <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Pickup</p>
                        <p className="mt-1 text-sm text-white">{order.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FlagIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Drop-off</p>
                        <p className="mt-1 text-sm text-white">{order.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Items</p>
                        <p className="mt-1 text-sm text-white">{order.pickupItems || '\u2014'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Vehicle</p>
                        <p className="mt-1 text-sm text-white">{order.pickupVehicleType || '\u2014'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Payment</p>
                        <p className="mt-1 text-sm text-white">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-orange-900/20 pt-4">
                    <div className="flex items-center gap-2">
                      {order.status === 'new' && (
                        <span className="text-xs text-sky-400">Awaiting processing</span>
                      )}
                      {order.status === 'completed' && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Delivered
                        </span>
                      )}
                      {order.status === 'rejected' && (
                        <span className="text-xs text-rose-400">Cancelled</span>
                      )}
                      {(order.status === 'processing' || order.status === 'picked_up') && (
                        <span className="text-xs text-amber-400">In transit</span>
                      )}
                    </div>

                    <Link
                      href={`/customer/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 border border-orange-900/40 bg-orange-950/30 px-3.5 py-1.5 text-xs font-medium text-orange-200 transition hover:border-orange-500/50 hover:bg-orange-950/50"
                    >
                      <ExternalLinkIcon />
                      Details
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}