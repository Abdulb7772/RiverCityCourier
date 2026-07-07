'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminNotifications, fetchCustomerNotifications, fetchDriverNotifications, markNotificationRead, type AppNotification } from '@/lib/notifications';

type NotificationsPageProps = {
  role: 'admin' | 'customer' | 'driver';
  userEmail?: string | null;
  userName?: string | null;
};

function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 22a2.25 2.25 0 0 0 2.1-1.45H9.9A2.25 2.25 0 0 0 12 22ZM19 17.5H5l1.2-1.5V11a5.8 5.8 0 0 1 4.3-5.6V4.5a1.5 1.5 0 1 1 3 0v.9A5.8 5.8 0 0 1 17 11v5l1 1.5z" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const d = date.toDateString();
  const t = today.toDateString();
  const y = yesterday.toDateString();

  if (d === t) return 'Today';
  if (d === y) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function NotificationsPage({ role, userEmail, userName }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        let data;
        if (role === 'admin') {
          data = await fetchAdminNotifications();
        } else if (role === 'customer' && userEmail) {
          data = await fetchCustomerNotifications(userEmail);
        } else if (role === 'driver' && userEmail) {
          data = await fetchDriverNotifications(userEmail);
        } else {
          data = { notifications: [], unreadCount: 0 };
        }
        if (mounted) setNotifications(data.notifications);
      } catch {
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [role, userEmail]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const grouped = useMemo(() => {
    const filtered = searchDate
      ? notifications.filter((n) => n.createdAt.startsWith(searchDate))
      : notifications;

    const groups: Record<string, AppNotification[]> = {};
    for (const n of filtered) {
      const label = getDateLabel(n.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    }
    return groups;
  }, [notifications, searchDate]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <main className="relative z-10 flex flex-1 flex-col gap-6 px-6 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.45em] text-orange-400/70">Notifications</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">
              All Notifications
            </h1>
            <p className="mt-2 text-sm text-orange-100/60">
              {loading ? '...' : `${notifications.length} total, ${unreadCount} unread`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(role === 'admin' ? '/admin' : role === 'customer' ? '/dashboard' : '/driver')}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-400/50 hover:bg-orange-500/20"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to {role === 'admin' ? 'dashboard' : role === 'customer' ? 'dashboard' : 'dashboard'}
          </button>
        </div>

        {/* Search by date */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="date-search" className="text-xs uppercase tracking-[0.3em] text-orange-400/70">Search by date</label>
            <div className="relative">
              <input
                id="date-search"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="border border-orange-900/30 bg-slate-950/80 px-4 py-2.5 pl-10 text-sm text-white outline-none focus:border-orange-500 [color-scheme:dark] [::-webkit-calendar-picker-indicator]:invert"
              />
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400/70">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {searchDate && (
            <button
              type="button"
              onClick={() => setSearchDate('')}
              className="text-xs text-orange-400 hover:text-orange-300 transition"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-orange-100/50">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-sm text-orange-100/50">
            <BellIcon className="h-10 w-10 text-orange-400/30" />
            No notifications yet.
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-orange-100/50">
            No notifications for the selected date.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <section key={dateLabel}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.35em] text-orange-400/60 font-semibold">{dateLabel}</span>
                  <span className="h-px flex-1 bg-orange-900/30" />
                  <span className="text-[0.6rem] text-orange-400/50">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMarkRead(item.id)}
                      className={`flex w-full items-start gap-4 border px-5 py-4 text-left transition ${
                        item.read
                          ? 'border-orange-900/20 bg-slate-950/40 text-orange-100/50'
                          : 'border-orange-900/40 bg-slate-950/70 text-white hover:bg-orange-950/40'
                      }`}
                    >
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-orange-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <p className={`text-sm font-medium ${item.read ? 'text-orange-100/50' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <span className="shrink-0 text-[0.6rem] text-orange-400/50">{formatTime(item.createdAt)}</span>
                        </div>
                        <p className={`mt-1 text-xs leading-relaxed ${item.read ? 'text-orange-100/40' : 'text-orange-100/60'}`}>
                          {item.message}
                        </p>
                        {item.type && (
                          <span className="mt-2 inline-block rounded-full border border-orange-900/30 bg-orange-950/30 px-2 py-0.5 text-[0.55rem] uppercase tracking-wider text-orange-400/60">
                            {item.type}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
