'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar, adminSidebarItems } from './AdminSidebar';
import { fetchDashboard, type DashboardData } from '@/lib/admin-dashboard';
import { fetchOrders, type AdminOrder } from '@/lib/admin-orders';
import { fetchReviews, type Review } from '@/lib/admin-reviews';

type AdminDashboardProps = {
  userEmail?: string | null;
  userName?: string | null;
  entrySource?: 'login' | null;
};

function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
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

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className = 'h-3 w-3', filled }: { className?: string; filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusStyles: Record<string, string> = {
  new: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  processing: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  picked_up: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
  completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

const statusLabel: Record<string, string> = {
  new: 'New',
  processing: 'Processing',
  picked_up: 'Picked Up',
  completed: 'Completed',
  rejected: 'Rejected',
};

export function AdminDashboard({ userEmail, userName, entrySource }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboard()
      .then(setDashboardData)
      .catch(() => setDashboardData(null));

    fetchOrders()
      .then((orders) => setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []))
      .catch(() => {});

    fetchReviews(1, 3)
      .then((result) => setRecentReviews(result?.data?.slice(0, 3) ?? []))
      .catch(() => {});

    setLoading(false);
  }, []);

  const summaryText = useMemo(() => {
    return 'Monitor the entire courier operation from a single command center.';
  }, []);

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const handleSectionSelect = (section: string) => {
    setActiveSection(section);
    setIsSidebarOpen(false);

    if (section === 'Orders') { router.push('/admin/orders'); return; }
    if (section === 'Drivers') { router.push('/admin/drivers'); return; }
    if (section === 'Customers') { router.push('/admin/customers'); return; }
    if (section === 'Pricing') { router.push('/admin/pricing'); return; }
    if (section === 'Dashboard') { router.push('/admin'); }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText={summaryText}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={adminSidebarItems}
        onSelect={handleSectionSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero / Welcome Section */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center px-2 py-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Admin Control Center
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white lg:text-4xl">
                Welcome{userName ? `, ${userName}` : ''}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Real-time overview of your courier operation. Key metrics, recent activity, and system status at a glance.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Role</p>
                <p className="mt-1 text-sm font-semibold text-amber-400">Admin</p>
              </div>
              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Session</p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">Verified</p>
              </div>
              <div className="flex min-w-[160px] flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Email</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">
                  {userEmail ?? 'admin@rivercitycourier.com'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full border border-orange-900/40 bg-slate-950/60 px-6 py-10 text-center text-sm text-orange-100/60">
              Loading stats...
            </div>
          ) : dashboardData ? (
            dashboardData.stats.map((card, index) => (
              <motion.article
                key={card.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="flex flex-col overflow-hidden border border-orange-900/40 bg-slate-950/60"
              >
                <div className="flex flex-col items-center justify-center bg-linear-to-br from-orange-500 to-amber-400 px-6 py-6">
                  <p className="text-xs font-medium text-white/90">{card.label}</p>
                  <p className="mt-2 text-4xl font-bold text-white">{card.value}</p>
                </div>
                <p className="px-4 py-3 text-center text-xs text-orange-100/60">{card.detail}</p>
              </motion.article>
            ))
          ) : null}
        </section>

        {/* Live Tracking + Recent Activity */}
        <section className="grid gap-5 xl:grid-cols-2">

          {/* Live Tracking - Coming Soon */}
          <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                <MapPinIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Live Tracking</h2>
                <p className="mt-1 text-sm text-orange-100/60">
                  Real-time GPS tracking for all active deliveries.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-orange-700/40 bg-orange-950/10 px-6 py-12 text-center">
              <MapPinIcon className="h-10 w-10 text-orange-500/40" />
              <p className="mt-4 text-lg font-semibold text-orange-300/80">Coming Soon</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-orange-100/50">
                Live driver tracking, route optimization, and real-time ETA updates will be available in the next release. This feature will display driver locations on an interactive map with delivery status overlays.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-sm">
                {['Driver Location', 'Route View', 'ETA Live'].map((label) => (
                  <div key={label} className="border border-orange-900/30 bg-orange-950/20 px-3 py-2 text-xs text-orange-300/50">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                <ActivityIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <p className="mt-1 text-sm text-orange-100/60">
                  Latest orders and status changes across the system.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-sm text-orange-100/60">
                  Loading recent orders...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-sm text-orange-100/60">
                  No recent orders found.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <TruckIcon className="h-5 w-5 shrink-0 text-orange-500/50" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">{order.customer}</p>
                      <p className="truncate text-xs text-orange-300/60">{order.pickup} &rarr; {order.destination}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`border px-2 py-0.5 text-[0.65rem] font-semibold ${statusStyles[order.status] ?? ''}`}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <ClockIcon className="h-3.5 w-3.5 text-orange-400/50" />
                      <span className="text-xs text-orange-400/50">{order.eta}</span>
                    </div>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={() => router.push('/admin/orders')}
                className="w-full border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20"
              >
                View All Orders
              </button>
            </div>
          </div>

        </section>

        {/* Bottom Stats Row */}
        <section className="grid gap-5 xl:grid-cols-2">
          <div className="border border-orange-900/40 bg-slate-950/60 p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Quick Snapshot</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Key Figures</h2>
            <div className="mt-5 space-y-3">
              {dashboardData ? [
                { label: 'Total Orders', value: dashboardData.totalOrders },
                { label: 'Total Drivers', value: dashboardData.totalDrivers },
                { label: 'Revenue', value: `$${dashboardData.totalRevenue.toLocaleString()}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                  <span className="text-sm text-orange-100/70">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              )) : (
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3 text-sm text-orange-100/60">Loading...</div>
              )}
            </div>
          </div>

          <div className="border border-orange-900/40 bg-slate-950/60 p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Feedback</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Recent Reviews</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3 text-sm text-orange-100/60">
                  Loading reviews...
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3 text-sm text-orange-100/60">
                  No reviews yet.
                </div>
              ) : (
                recentReviews.map((review) => (
                  <div key={review.id} className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-white">{review.customerName}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            filled={star <= review.rating}
                            className={`h-3 w-3 ${star <= review.rating ? 'text-amber-400' : 'text-orange-800/40'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-orange-300/70 leading-relaxed line-clamp-2">{review.comment}</p>
                    <p className="mt-1 text-[0.65rem] text-orange-400/40">{review.orderId}</p>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={() => router.push('/admin/reviews')}
                className="w-full border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20"
              >
                View All Reviews
              </button>
            </div>
          </div>
        </section>

      </main>

      {entrySource === 'login' }
    </div>
  );
}
