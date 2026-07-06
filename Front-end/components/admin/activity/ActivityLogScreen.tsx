'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar, adminSidebarItems } from '../AdminSidebar';
import { fetchActivity, type Activity } from '@/lib/admin-activity';

type ActivityLogScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  login: { icon: <LoginIcon />, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10', label: 'Login' },
  update: { icon: <EditIcon />, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', label: 'Update' },
  create: { icon: <PlusIcon />, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', label: 'Create' },
  delete: { icon: <TrashIcon />, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', label: 'Delete' },
  settings: { icon: <GearIcon />, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10', label: 'Settings' },
};

export function ActivityLogScreen({ userEmail, userName }: ActivityLogScreenProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Activity Log');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const limit = 10;
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetchActivity(currentPage, limit)
      .then((result) => {
        setActivities(result.data);
        setTotalPages(result.totalPages);
        setTotalActivities(result.total);
      })
      .catch(() => { setActivities([]); setTotalPages(1); setTotalActivities(0); })
      .finally(() => setLoading(false));
  }, [currentPage]);

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/admin', Orders: '/admin/orders', Drivers: '/admin/drivers',
        Customers: '/admin/customers', Pricing: '/admin/pricing', Reports: '/admin/reports',
        Reviews: '/admin/reviews', 'Activity Log': '/admin/activity',
        Support: '/admin/support',
      };
      router.push(paths[item] || '/admin');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  const loginActivities = activities.filter((a) => a.type === 'login');
  const otherActivities = activities.filter((a) => a.type !== 'login');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Track every action taken within the admin panel."
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

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Audit Trail
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">Activity Log</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                A chronological record of admin actions, logins, and system changes. Use this log to review who did what and when.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Events', value: totalActivities, color: 'text-sky-300' },
              { label: 'Logins', value: loginActivities.length, color: 'text-amber-300' },
              { label: 'Changes', value: otherActivities.length, color: 'text-emerald-300' },
              { label: 'Session Duration', value: loginActivities.length > 0 ? 'Active' : '—', color: 'text-rose-300' },
            ].map((stat) => (
              <div key={stat.label} className="border border-orange-900/40 bg-orange-950/25 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-400/70">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            Loading activity log...
          </div>
        ) : activities.length === 0 ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            No activity recorded yet.
          </div>
        ) : (
          <section className="flex flex-col gap-5">

            {/* Current Session */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Current Session</h2>
                  <p className="mt-0.5 text-xs text-orange-100/60">
                    You logged in {activities.length > 0 ? formatTime(activities[0].timestamp) : 'recently'}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-orange-400/60">
                    <MapPinIcon className="h-3 w-3" />
                    Login Location
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Coming Soon</p>
                </div>
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-orange-400/60">
                    <ClockIcon className="h-3 w-3" />
                    Session Duration
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Active</p>
                </div>
                <div className="border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-orange-400/60">
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400/30 text-[0.45rem] font-bold text-emerald-300">&#10003;</span>
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-400">Authenticated</p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Activity Timeline</h2>
              <p className="mt-0.5 text-xs text-orange-100/60">All recorded admin actions in reverse chronological order.</p>

              <div className="mt-6 space-y-4">
                {activities.map((activity, index) => {
                  const cfg = typeConfig[activity.type] ?? typeConfig.update;
                  return (
                    <div key={activity.id} className="relative flex gap-5">
                      {/* Timeline line */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-orange-900/30" />
                      )}

                      {/* Icon */}
                      <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border ${cfg.color}`}>
                        {cfg.icon}
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`border px-2 py-0.5 text-[0.6rem] font-semibold ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-orange-400/50">{formatTime(activity.timestamp)}</span>
                          {activity.duration !== '—' && (
                            <span className="text-xs text-orange-400/40">{activity.duration} duration</span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-orange-100/80">{activity.description}</p>
                        <div className="mt-1 flex flex-wrap gap-4 text-[0.65rem] text-orange-400/50">
                          <span>By: {activity.user}</span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-2.5 w-2.5" />
                            Location: {activity.location === '—' ? 'Coming Soon' : activity.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 border-t border-orange-900/30 pt-6">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-orange-400/60">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

          </section>
        )}
      </main>
    </div>
  );
}
