'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { fetchReportData } from '@/lib/admin-reports';

type ReportsScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

function ChartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 20h16M6 16l4-6 4 4 4-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PieChartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3v9l7 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChartIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20v-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrendingUpIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: '#1a0800',
    border: '1px solid rgba(249,115,22,0.4)',
    borderRadius: '0',
    fontSize: '12px',
    color: '#fff',
  },
  labelStyle: { color: '#fb923c' },
};

export function ReportsScreen({ userEmail, userName }: ReportsScreenProps) {
  const [reportData, setReportData] = useState<Awaited<ReturnType<typeof fetchReportData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Reports');
  const router = useRouter();

  useEffect(() => {
    fetchReportData()
      .then(setReportData)
      .catch(() => setReportData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/admin', Orders: '/admin/orders', Drivers: '/admin/drivers',
        Customers: '/admin/customers', Pricing: '/admin/pricing', Reports: '/admin/reports',
        Support: '/admin/support',
      };
      router.push(paths[item] || '/admin');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Analytics, charts, and export-ready metrics for the entire courier operation."
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
                Reports & Analytics
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                Operational Reports
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Key metrics, trends, and performance data across orders, revenue, drivers, and fleet.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Orders', value: reportData?.totalOrders ?? 0, color: 'text-sky-300' },
              { label: 'Total Drivers', value: reportData?.totalDrivers ?? 0, color: 'text-amber-300' },
              { label: 'Total Reviews', value: reportData?.totalReviews ?? 0, color: 'text-emerald-300' },
              { label: 'Avg Rating', value: reportData?.averageRating ?? '0.0', color: 'text-orange-300' },
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
            Loading report data...
          </div>
        ) : !reportData ? (
          <div className="border border-rose-900/40 bg-rose-950/30 px-6 py-12 text-center text-sm text-rose-300">
            Failed to load report data.
          </div>
        ) : (
          <section className="grid gap-6 xl:grid-cols-2">

            {/* Orders by Status - Pie */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <PieChartIcon className="h-5 w-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">Orders by Status</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.ordersByStatus.map((o) => ({
                        ...o,
                        color: ({ new: '#38bdf8', processing: '#fbbf24', picked_up: '#818cf8', completed: '#34d399', rejected: '#f43f5e' } as Record<string, string>)[o.name] || '#94a3b8',
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {reportData.ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={({ new: '#38bdf8', processing: '#fbbf24', picked_up: '#818cf8', completed: '#34d399', rejected: '#f43f5e' } as Record<string, string>)[reportData.ordersByStatus[i].name] || '#94a3b8'} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', color: '#fdba74' }}
                      formatter={(value: string) => <span style={{ color: '#fdba74' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary stats */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChartIcon className="h-5 w-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">System Overview</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Total Orders', value: reportData.totalOrders },
                  { label: 'Total Drivers', value: reportData.totalDrivers },
                  { label: 'Total Reviews', value: reportData.totalReviews },
                  { label: 'Average Rating', value: reportData.averageRating },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-5 py-4">
                    <span className="text-sm text-orange-100/70">{item.label}</span>
                    <span className="text-lg font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}
      </main>
    </div>
  );
}
