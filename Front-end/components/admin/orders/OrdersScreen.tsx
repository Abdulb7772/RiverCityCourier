'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { CompletedOrdersModal } from './CompletedOrdersModal';
import { AdminOrder, fetchOrders, updateOrderStatus } from '@/lib/admin-orders';

type OrdersScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

const statusStyles: Record<AdminOrder['status'], string> = {
  new: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  processing: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  picked_up: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
  completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

const statusLabel: Record<AdminOrder['status'], string> = {
  new: 'New',
  processing: 'Processing',
  picked_up: 'Picked Up',
  completed: 'Completed',
  rejected: 'Rejected',
};

const statusProgress: Record<AdminOrder['status'], number> = {
  new: 15,
  processing: 40,
  picked_up: 70,
  completed: 100,
  rejected: 0,
};

const statusProgressColor: Record<AdminOrder['status'], string> = {
  new: 'from-sky-500 to-sky-400',
  processing: 'from-amber-500 to-amber-400',
  picked_up: 'from-indigo-500 to-indigo-400',
  completed: 'from-emerald-500 to-emerald-400',
  rejected: 'from-rose-500 to-rose-400',
};

const priorityStyles: Record<string, string> = {
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
};

// ── icons ──────────────────────────────────────────────────────────────────
function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function UserIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

function ListIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// ── component ──────────────────────────────────────────────────────────────
export function OrdersScreen({ userEmail, userName }: OrdersScreenProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeSection, setActiveSection] = useState('Orders');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected'),
    [orders],
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders],
  );

  const handleStatusChange = async (orderId: string, status: AdminOrder['status']) => {
    try {
      const updated = await updateOrderStatus(orders, orderId, status);
      setOrders(updated);
    } catch {
      setOrders([...orders]);
    }
  };

  const handleSidebarSelect = (item: string) => {
    setActiveSection(item);
  };

  const handleLogout = () => { window.location.href = '/auth/login'; };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Monitor every order from intake to pickup and handoff."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={adminSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <CompletedOrdersModal orders={completedOrders} isOpen={showCompleted} onClose={() => setShowCompleted(false)} />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Admin Orders</p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">Courier Order Command Center</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Track newly placed requests, active pickups, and completed deliveries from one dedicated screen.
              </p>
            </div>

          </div>

          {/* Quick stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'New', value: orders.filter((o) => o.status === 'new').length, color: 'text-sky-300', icon: <ListIcon className="h-4 w-4" /> },
              { label: 'Active', value: activeOrders.length, color: 'text-amber-300', icon: <TruckIcon className="h-4 w-4" /> },
              { label: 'Completed', value: completedOrders.length, color: 'text-emerald-300', icon: <CheckCircleIcon className="h-4 w-4" /> },
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

        {/* Main grid */}
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">

          {/* Order queue */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <TruckIcon className="h-5 w-5 text-orange-400" />
                Live Order Queue
              </h2>
              <span className="text-xs text-orange-200/50">Click an order to view full details</span>
            </div>

            {loading ? (
              <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-10 text-center text-sm text-orange-100/60">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-10 text-center text-sm text-orange-100/60">
                No orders found.
              </div>
            ) : (
              orders.map((order) => {
                const canReject = order.status === 'new' || order.status === 'processing';
                const progress = statusProgress[order.status];
                return (
                  <article key={order.id} className="border border-orange-900/40 bg-slate-950/60 p-5 sm:p-6">

                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{order.orderNumber}</span>
                        <span className={`border px-2.5 py-0.5 text-[0.7rem] font-semibold ${statusStyles[order.status]}`}>
                          {statusLabel[order.status]}
                        </span>
                        <span className={`border px-2.5 py-0.5 text-[0.7rem] font-medium ${priorityStyles[order.priority] ?? 'border-slate-500/30 bg-slate-500/10 text-slate-300'}`}>
                          {order.priority} priority
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 border border-orange-900/30 bg-orange-950/20 px-3 py-1.5 text-xs text-orange-200/70">
                          <ClockIcon className="h-3.5 w-3.5" />
                          ETA {order.eta}
                        </div>
                        {canReject ? (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(order.id, 'rejected'); }}
                            className="border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:border-rose-400/50 hover:bg-rose-500/20 hover:text-rose-200"
                          >
                            Reject
                          </button>
                        ) : (
                          <div className="border border-slate-700/40 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-500">
                            Locked
                          </div>
                        )}
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
                          className={`h-full bg-linear-to-r ${statusProgressColor[order.status]} transition-all duration-700`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details grid */}
                    <Link href={`/admin/orders/${order.id}`}>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-2">
                          <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                          <div>
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Customer</p>
                            <p className="mt-1 text-sm text-white">{order.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500/60" />
                          <div>
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Driver</p>
                            <p className="mt-1 text-sm text-white">{order.assignedDriver}</p>
                          </div>
                        </div>
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
                      </div>
                      {order.note && (
                        <p className="mt-3 border-t border-orange-900/20 pt-3 text-sm leading-relaxed text-orange-100/60">
                          {order.note}
                        </p>
                      )}
                    </Link>
                  </article>
                );
              })
            )}
          </div>

          {/* Sidebar panels */}
          <aside className="flex flex-col gap-5">

            {/* Order health */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <ListIcon className="h-5 w-5 text-orange-400" />
                  Order Health
                </h2>
                <span className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'New requests', value: orders.filter((o) => o.status === 'new').length, color: 'text-sky-300', bar: 'from-sky-500 to-sky-400' },
                  { label: 'Processing', value: orders.filter((o) => o.status === 'processing').length, color: 'text-amber-300', bar: 'from-amber-500 to-amber-400' },
                  { label: 'Picked up', value: orders.filter((o) => o.status === 'picked_up').length, color: 'text-indigo-300', bar: 'from-indigo-500 to-indigo-400' },
                ].map((stat) => (
                  <div key={stat.label} className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-orange-100/70">{stat.label}</p>
                      <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className="mt-2 h-1 w-full bg-orange-950/60">
                      <div
                        className={`h-full bg-linear-to-r ${stat.bar} transition-all duration-500`}
                        style={{ width: orders.length ? `${(stat.value / orders.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCompleted((value) => !value)}
                className={`mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 ${
                  showCompleted
                    ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-200 shadow-emerald-500/20'
                    : 'border-fuchsia-500/50 bg-linear-to-r from-fuchsia-600 via-rose-500 to-amber-500 text-white shadow-fuchsia-500/20 hover:scale-[1.01] hover:shadow-2xl'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                {showCompleted ? 'Hide completed orders' : 'Show completed orders'}
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-black ${
                  showCompleted ? 'bg-emerald-600/40 text-emerald-100' : 'bg-white/20 text-white'
                }`}>
                  {completedOrders.length}
                </span>
              </button>
            </div>


          </aside>
        </section>
      </main>
    </div>
  );
}