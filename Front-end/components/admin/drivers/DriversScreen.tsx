'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { AddDriverModal } from './AddDriverModal';
import { AdminDriver, fetchDrivers } from '@/lib/admin-drivers';

/* ─── Icons ─────────────────────────────────────────────────────────────── */

function ShieldCheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function MailIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="0" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="4" width="18" height="18" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function UsersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 3.5a3.5 3.5 0 0 1 0 7M22 20c0-3.5-2.5-5.8-6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 22s-8-6.5-8-13a8 8 0 1 1 16 0c0 6.5-8 13-8 13z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/* ─── Driver card ────────────────────────────────────────────────────────── */

function DriverCard({
  driver,
  onView,
}: {
  driver: AdminDriver;
  onView: () => void;
}) {
  return (
    <div className="border border-orange-900/30 bg-slate-950/70">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 border-b border-orange-900/20 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar initials */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-orange-900/40 bg-orange-950/50 text-xs font-bold text-orange-300 uppercase tracking-wide">
            {driver.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0">
            <p className="text-[0.58rem] uppercase tracking-[0.35em] text-orange-400/50">Driver</p>
            <p className="mt-0.5 text-sm font-semibold text-white truncate">{driver.fullName}</p>
          </div>
        </div>
        {driver.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 bg-emerald-400" />
            Verified
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 bg-amber-400" />
            Pending
          </span>
        )}
      </div>

      {/* Card fields */}
      <div className="grid grid-cols-2 divide-x divide-orange-900/20">
        <div className="flex items-start gap-2 px-4 py-3 border-b border-orange-900/20">
          <MailIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-400/50" />
          <div className="min-w-0">
            <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Email</p>
            <p className="mt-1 text-xs text-orange-100/80 truncate">{driver.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 px-4 py-3 border-b border-orange-900/20">
          <PhoneIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-400/50" />
          <div className="min-w-0">
            <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Phone</p>
            <p className="mt-1 text-xs text-orange-100/80 truncate">{driver.phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 px-4 py-3 col-span-2">
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-400/50" />
          <div>
            <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Joined</p>
            <p className="mt-1 text-xs text-orange-100/80">{new Date(driver.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Card actions */}
      <div className="flex items-center justify-between gap-2 border-t border-orange-900/20 px-4 py-3">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-300/70 hover:text-orange-200 transition"
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
          View details
        </button>

        {driver.verified && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/70">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Active
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main screen ────────────────────────────────────────────────────────── */

export function DriversScreen({
  userEmail,
  userName,
}: {
  userEmail?: string | null;
  userName?: string | null;
}) {
  const router = useRouter();
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Drivers');
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [verifiedPage, setVerifiedPage] = useState(1);
  const [pendingPerPage, setPendingPerPage] = useState(4);
  const [verifiedPerPage, setVerifiedPerPage] = useState(4);

  const handleDriverAdded = (driver: AdminDriver) => {
    setDrivers((prev) => [driver, ...prev]);
    setIsAddDriverOpen(false);
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchDrivers();
        if (isMounted) setDrivers(data);
      } catch (err) {
        if (isMounted) setRequestError(err instanceof Error ? err.message : 'Unable to load drivers.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handlePendingPerPageChange = (value: number) => {
    setPendingPerPage(value > 0 ? value : 1);
    setPendingPage(1);
  };

  const handleVerifiedPerPageChange = (value: number) => {
    setVerifiedPerPage(value > 0 ? value : 1);
    setVerifiedPage(1);
  };

  const pendingDrivers = drivers.filter((d) => !d.verified);
  const verifiedDrivers = drivers.filter((d) => d.verified);
  const pendingPageCount = Math.max(1, Math.ceil(pendingDrivers.length / pendingPerPage));
  const verifiedPageCount = Math.max(1, Math.ceil(verifiedDrivers.length / verifiedPerPage));
  const pendingDriversPage = pendingDrivers.slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage);
  const verifiedDriversPage = verifiedDrivers.slice((verifiedPage - 1) * verifiedPerPage, verifiedPage * verifiedPerPage);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Manage driver accounts, review submitted documents, and approve verifications."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={adminSidebarItems}
        onSelect={(item) => setActiveSection(item)}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <main className="relative z-10 flex flex-1 flex-col w-full">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-6 sm:px-8 lg:px-12">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.45em] text-orange-400/60">Fleet management</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Drivers</h1>
          </div>
          {/* Summary stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 border border-orange-900/30 bg-orange-950/30 px-3 py-1.5 text-xs font-medium text-orange-200/80">
              <UsersIcon className="h-3.5 w-3.5 text-orange-400/60" />
              {loading ? '–' : drivers.length} total
            </span>
            <span className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs font-medium text-emerald-300/80">
              <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400/60" />
              {loading ? '–' : verifiedDrivers.length} verified
            </span>
            <span className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/8 px-3 py-1.5 text-xs font-medium text-amber-300/80">
              <ClockIcon className="h-3.5 w-3.5 text-amber-400/60" />
              {loading ? '–' : pendingDrivers.length} pending
            </span>
          </div>
        </div>

        <div className="mx-6 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="text-sm text-orange-100/70">Create and manage driver accounts from one place.</p>
          <button
            type="button"
            onClick={() => setIsAddDriverOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110"
          >
            Add driver
          </button>
        </div>

        {requestError && (
          <div className="mx-6 mb-4 border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-300 sm:mx-8 lg:mx-12">
            {requestError}
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center border border-orange-900/30 mx-6 mb-6 sm:mx-8 lg:mx-12 bg-slate-950/50 p-16 text-sm text-orange-100/50">
            Loading drivers…
          </div>
        ) : (
          <div className="flex flex-1 flex-col">

            {/* ── Two full-screen columns ── */}
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">

              {/* LEFT — Awaiting Verification */}
              <div className="flex flex-col border-t border-l border-b border-orange-900/40 lg:border-r-0">

                {/* Column tab header */}
                <div className="flex flex-col gap-3 border-b border-orange-900/40 bg-amber-500/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center border border-amber-500/30 bg-amber-950/50">
                      <ClockIcon className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.4em] text-amber-400/70 font-semibold">
                        Awaiting verification
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="inline-flex items-center gap-1.5 border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-300">
                      <span className="h-1.5 w-1.5 bg-amber-400" />
                      {pendingDrivers.length} pending
                    </span>
                    <div className="flex items-center gap-2 text-xs text-orange-100/80">
                      <label className="uppercase tracking-[0.35em] text-orange-300/70">Items / page</label>
                      <input
                        type="number"
                        value={pendingPerPage}
                        min={1}
                        onChange={(e) => handlePendingPerPageChange(Number(e.target.value))}
                        className="w-20 rounded-md border border-orange-900/40 bg-slate-950/80 px-2 py-1 text-sm text-white outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Pending driver list */}
                <div className="flex flex-1 flex-col divide-y divide-orange-900/20 overflow-y-auto">
                  {pendingDrivers.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center gap-2 py-20 text-sm text-orange-100/40">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-400/40" />
                      No drivers awaiting verification
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0 divide-y divide-orange-900/20">
                      {pendingDriversPage.map((driver) => (
                        <div key={driver.id} className="p-5">
                          <DriverCard
                            driver={driver}
                            onView={() => router.push(`/admin/drivers/${driver.id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {pendingDrivers.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-900/20 bg-slate-950/70 px-6 py-4 text-sm text-orange-100/80">
                    <div>
                      Page {pendingPage} of {pendingPageCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingPage((page) => Math.max(1, page - 1))}
                        disabled={pendingPage === 1}
                        className="rounded border border-orange-900/30 bg-orange-950/30 px-3 py-1 text-xs text-orange-100 transition disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingPage((page) => Math.min(pendingPageCount, page + 1))}
                        disabled={pendingPage === pendingPageCount}
                        className="rounded border border-orange-900/30 bg-orange-950/30 px-3 py-1 text-xs text-orange-100 transition disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Verified Drivers */}
              <div className="flex flex-col border border-orange-900/40">

                {/* Column tab header */}
                <div className="flex flex-col gap-3 border-b border-orange-900/40 bg-emerald-500/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center border border-emerald-500/30 bg-emerald-950/50">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.4em] text-emerald-400/70 font-semibold">
                        Verified drivers
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="inline-flex items-center gap-1.5 border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 bg-emerald-400" />
                      {verifiedDrivers.length} active
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-100/80">
                      <label className="uppercase tracking-[0.35em] text-orange-300/70">Items / page</label>
                      <input
                        type="number"
                        value={verifiedPerPage}
                        min={1}
                        onChange={(e) => handleVerifiedPerPageChange(Number(e.target.value))}
                        className="w-20 rounded-md border border-orange-900/40 bg-slate-950/80 px-2 py-1 text-sm text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Verified driver list */}
                <div className="flex flex-1 flex-col divide-y divide-orange-900/20 overflow-y-auto">
                  {verifiedDrivers.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center gap-2 py-20 text-sm text-orange-100/40">
                      <UserIcon className="h-5 w-5 text-orange-400/30" />
                      No verified drivers yet
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0 divide-y divide-orange-900/20">
                      {verifiedDriversPage.map((driver) => (
                        <div key={driver.id} className="p-5">
                          <DriverCard
                            driver={driver}
                            onView={() => router.push(`/admin/drivers/${driver.id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {verifiedDrivers.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-900/20 bg-slate-950/70 px-6 py-4 text-sm text-orange-100/80">
                    <div>
                      Page {verifiedPage} of {verifiedPageCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVerifiedPage((page) => Math.max(1, page - 1))}
                        disabled={verifiedPage === 1}
                        className="rounded border border-orange-900/30 bg-orange-950/30 px-3 py-1 text-xs text-orange-100 transition disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifiedPage((page) => Math.min(verifiedPageCount, page + 1))}
                        disabled={verifiedPage === verifiedPageCount}
                        className="rounded border border-orange-900/30 bg-orange-950/30 px-3 py-1 text-xs text-orange-100 transition disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Full-width location feed ── */}
            <div className="border border-t-0 border-orange-900/40 bg-slate-950/60">

              {/* Feed header */}
              <div className="flex items-center gap-3 border-b border-orange-900/30 px-6 py-4 bg-orange-500/3">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-900/40 bg-orange-950/50">
                  <TruckIcon className="h-3.5 w-3.5 text-orange-400/80" />
                </span>
                <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60 font-semibold">
                  Live location feed
                </p>
                <span className="ml-auto inline-flex items-center gap-1.5 border border-orange-900/25 bg-orange-950/20 px-2.5 py-1 text-[0.65rem] font-medium text-orange-300/55">
                  <span className="h-1.5 w-1.5 animate-pulse bg-orange-400/50" />
                  Awaiting signal
                </span>
              </div>

              {/* Feed body — 3 stat cells + placeholder map */}
              <div className="grid grid-cols-3 divide-x divide-orange-900/20 border-b border-orange-900/20">
                <div className="flex items-center gap-3 px-6 py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <MapPinIcon className="h-3.5 w-3.5 text-orange-400/60" />
                  </span>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Active positions</p>
                    <p className="mt-1 text-lg font-semibold text-white">—</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <TruckIcon className="h-3.5 w-3.5 text-orange-400/60" />
                  </span>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">On route</p>
                    <p className="mt-1 text-lg font-semibold text-white">—</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <ClockIcon className="h-3.5 w-3.5 text-orange-400/60" />
                  </span>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Last update</p>
                    <p className="mt-1 text-lg font-semibold text-white">—</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 px-6 py-10 text-sm text-orange-100/35">
                <TruckIcon className="h-5 w-5 text-orange-400/25" />
                Live vehicle positions will stream here once drivers are verified and trackers are connected.
              </div>
            </div>

          </div>
        )}
      </main>

      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onDriverAdded={handleDriverAdded}
      />
    </div>
  );
}