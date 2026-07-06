'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DriverNavbar } from './DriverNavbar';
import { DriverSidebar, driverSidebarItems } from './DriverSidebar';
import { fetchDriverDashboard, type DriverDashboardData } from '@/lib/driver-dashboard';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
  entrySource?: 'login' | 'signup' | null;
};

const statusFlowLabels: Record<string, string> = {
  accepted: 'Accepted',
  arrived_at_pickup: 'Arrived at Pickup',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  arrived_at_destination: 'Arrived at Destination',
};

const quickActions = [
  { label: 'Assigned Orders', desc: 'View incoming deliveries', path: '/driver/orders', icon: '📋' },
  { label: 'In Progress', desc: 'Track active delivery', path: '/driver/orders/in-progress', icon: '🚚' },
  { label: 'Completed', desc: 'View delivery history', path: '/driver/orders/completed', icon: '✅' },
  { label: 'Verification', desc: 'Manage your documents', path: '/driver/verification', icon: '🪪' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    accepted: 'text-blue-300 border-blue-600/40 bg-blue-950/30',
    arrived_at_pickup: 'text-amber-300 border-amber-600/40 bg-amber-950/30',
    picked_up: 'text-orange-300 border-orange-600/40 bg-orange-950/30',
    in_transit: 'text-sky-300 border-sky-600/40 bg-sky-950/30',
    arrived_at_destination: 'text-purple-300 border-purple-600/40 bg-purple-950/30',
    completed: 'text-emerald-300 border-emerald-600/40 bg-emerald-950/30',
  };
  return (
    <span className={`rounded border px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider ${colorMap[status] || 'text-orange-300 border-orange-600/40 bg-orange-950/30'}`}>
      {statusFlowLabels[status] || status}
    </span>
  );
}

export function DriverDashboard({ userEmail, userName, entrySource }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [availability, setAvailability] = useState<'Online' | 'Offline' | 'Busy'>('Online');
  const [data, setData] = useState<DriverDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchDriverDashboard(userEmail)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [userEmail]);

  const summaryText = useMemo(() => {
    if (activeSection === 'Dashboard') {
      return 'Stay ready for live dispatch, delivery updates, and proof-of-delivery tasks.';
    }
    return `Working in ${activeSection.toLowerCase()} keeps the route queue moving.`;
  }, [activeSection]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  const handleSidebarSelect = useCallback((item: string) => {
    setActiveSection(item);
    setIsSidebarOpen(false);
    if (item === 'Assigned Orders') router.push('/driver/orders');
    if (item === 'In Progress') router.push('/driver/orders/in-progress');
    if (item === 'Completed') router.push('/driver/orders/completed');
    if (item === 'Verification') router.push('/driver/verification');
    if (item === 'Support') router.push('/driver/support');
  }, [router]);

  const statusColor = availability === 'Online' ? 'text-emerald-400' : availability === 'Busy' ? 'text-amber-400' : 'text-rose-400';
  const statusDot = availability === 'Online' ? 'bg-emerald-500' : availability === 'Busy' ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <DriverNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText={summaryText}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <DriverSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={driverSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="w-full border border-orange-900/40 bg-linear-to-br from-orange-950/40 via-slate-950/60 to-slate-950/80 px-6 py-8 backdrop-blur-xl sm:px-8 sm:py-10">
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center">
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Driver Control Center</p>
              <h2 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                {getGreeting()}{userName ? `, ${userName}` : ''}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                {loading
                  ? 'Loading your dashboard...'
                  : data?.activeOrder
                    ? `You have an active delivery to ${data.activeOrder.destination}. Head to your In Progress section to manage it.`
                    : 'No active deliveries right now. Stay online and await dispatch assignments.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/driver/orders')}
                  className="border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-xs font-medium text-orange-200 transition hover:border-orange-400/60 hover:bg-orange-500/30"
                >
                  View Orders
                </button>
                {data?.activeOrder && (
                  <button
                    type="button"
                    onClick={() => router.push('/driver/orders/in-progress')}
                    className="border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-medium text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/30"
                  >
                    Active Delivery
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAvailability(availability === 'Online' ? 'Offline' : 'Online')}
                className="flex min-w-[110px] flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center transition hover:border-orange-700/60"
              >
                <p className="text-xs text-orange-400/70">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                  <p className={`text-sm font-semibold ${statusColor}`}>{availability}</p>
                </div>
                <p className="mt-0.5 text-[0.55rem] text-orange-400/50">Tap to toggle</p>
              </button>

              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Completed Today</p>
                <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : data?.completedToday ?? 0}</p>
              </div>

              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Total Deliveries</p>
                <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : data?.totalDeliveries ?? 0}</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/40 border-t-orange-400" />
          </div>
        ) : (
          <>
            {/* Active Order Card */}
            {data?.activeOrder && (
              <section className="border border-emerald-900/40 bg-linear-to-br from-emerald-950/30 via-slate-950/60 to-slate-950/80 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald-400/70">Active Delivery</p>
                    </div>
                    <h2 className="mt-2 text-xl font-semibold text-white">{data.activeOrder.orderNumber}</h2>
                  </div>
                  <StatusBadge status={data.activeOrder.status} />
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <p className="text-[0.55rem] uppercase tracking-wider text-orange-400/50">Customer</p>
                    <p className="mt-1 text-sm text-white">{data.activeOrder.customer}</p>
                  </div>
                  <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <p className="text-[0.55rem] uppercase tracking-wider text-orange-400/50">Pickup</p>
                    <p className="mt-1 text-sm text-white">{data.activeOrder.pickup}</p>
                  </div>
                  <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <p className="text-[0.55rem] uppercase tracking-wider text-orange-400/50">Destination</p>
                    <p className="mt-1 text-sm text-white">{data.activeOrder.destination}</p>
                  </div>
                  <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <p className="text-[0.55rem] uppercase tracking-wider text-orange-400/50">ETA</p>
                    <p className="mt-1 text-sm text-white">{data.activeOrder.eta || 'N/A'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/driver/orders/in-progress')}
                  className="mt-4 border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 text-sm font-medium text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/30"
                >
                  Manage Delivery
                </button>
              </section>
            )}

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => router.push(action.path)}
                  className="group border border-orange-900/40 bg-slate-950/60 p-5 text-left transition hover:border-orange-600/60 hover:bg-orange-950/30"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-orange-200">{action.label}</h3>
                  <p className="mt-1 text-xs text-orange-300/60">{action.desc}</p>
                </button>
              ))}
            </section>

            {/* Recent Completed Orders */}
            {data?.recentCompleted && data.recentCompleted.length > 0 && (
              <section className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">History</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Recent Deliveries</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/driver/orders/completed')}
                    className="border border-orange-700/40 bg-orange-950/30 px-3 py-1.5 text-xs text-orange-200 transition hover:border-orange-500/60 hover:bg-orange-900/50"
                  >
                    View All
                  </button>
                </div>
                <div className="mt-5 grid gap-3">
                  {data.recentCompleted.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-4 border border-orange-900/30 bg-orange-950/20 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                        <p className="mt-0.5 text-xs text-orange-300/70">{order.customer}</p>
                      </div>
                      <div className="hidden min-w-0 flex-1 sm:block">
                        <p className="text-xs text-orange-400/60">Pickup</p>
                        <p className="text-sm text-white truncate">{order.pickup}</p>
                      </div>
                      <div className="hidden min-w-0 flex-1 lg:block">
                        <p className="text-xs text-orange-400/60">Destination</p>
                        <p className="text-sm text-white truncate">{order.destination}</p>
                      </div>
                      <span className="shrink-0 rounded border border-emerald-600/40 bg-emerald-950/30 px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-emerald-300">
                        Delivered
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No data state */}
            {!data?.activeOrder && (!data?.recentCompleted || data.recentCompleted.length === 0) && (
              <section className="flex flex-col items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 py-16">
                <span className="text-5xl">📦</span>
                <h2 className="mt-4 text-xl font-semibold text-white">No deliveries yet</h2>
                <p className="mt-2 text-sm text-orange-300/60">Your completed deliveries and active orders will appear here.</p>
                <button
                  type="button"
                  onClick={() => router.push('/driver/orders')}
                  className="mt-6 border border-orange-500/40 bg-orange-500/15 px-5 py-2.5 text-sm font-medium text-orange-200 transition hover:border-orange-400/60 hover:bg-orange-500/30"
                >
                  View Assigned Orders
                </button>
              </section>
            )}
          </>
        )}
      </main>

      {entrySource && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 border border-emerald-500/30 bg-emerald-500/15 px-5 py-2 text-sm text-emerald-100 shadow-xl backdrop-blur-xl">
          Driver session active
        </div>
      )}
    </div>
  );
}
