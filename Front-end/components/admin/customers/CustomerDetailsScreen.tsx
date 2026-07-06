'use client';

import { useEffect, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar, adminSidebarItems } from '../AdminSidebar';
import { AdminCustomer, fetchCustomer, updateCustomerStatus } from '@/lib/admin-customers';

function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M7 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-4 9a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 4h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
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

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, string> = {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    suspended: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    blocked: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold ${statusMap[status] ?? 'border-slate-700/40 bg-slate-950/30 text-slate-200'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400' : status === 'suspended' ? 'bg-amber-400' : status === 'blocked' ? 'bg-rose-400' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
}

export function CustomerDetailsScreen({ userEmail, userName, customerId }: { userEmail?: string | null; userName?: string | null; customerId: string }) {
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCustomer() {
      try {
        const fetched = await fetchCustomer(customerId);
        if (mounted) {
          setCustomer(fetched);
          setStatus(fetched.status);
        }
      } catch (error) {
        if (mounted) setRequestError(error instanceof Error ? error.message : 'Unable to load customer.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (customerId) loadCustomer();
    return () => {
      mounted = false;
    };
  }, [customerId]);

  const handleSave = async () => {
    if (!customer) return;
    setRequestError('');
    setSaving(true);

    try {
      const updated = await updateCustomerStatus(customer.id, status);
      setCustomer(updated);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to update customer status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="View customer details, update status, and audit key account information."
        onMenuClick={() => {}}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <AdminSidebar
        isOpen={false}
        activeSection="Customers"
        items={adminSidebarItems}
        onSelect={() => {}}
        onClose={() => {}}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <main className="relative z-10 flex flex-1 flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/70">Customer details</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{customer ? customer.fullName : 'Customer profile'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-orange-100/60">
              Review and manage a single customer account with quick access to status controls and profile details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { if (typeof window !== 'undefined') window.location.href = '/admin/customers'; }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-400/50 hover:bg-orange-500/20"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to customers
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-orange-900/40 bg-slate-950/60 p-10 text-sm text-orange-100/70">
            Loading customer details…
          </div>
        ) : !customer ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-orange-900/40 bg-slate-950/60 p-10 text-sm text-orange-100/70">
            Customer not found.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-3xl border border-orange-900/40 bg-slate-950/60 p-6 shadow-xl shadow-black/20 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-900/20 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-orange-900/30 bg-orange-950/40 text-2xl font-semibold text-orange-200">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{customer.fullName}</p>
                    <p className="mt-1 text-xs text-orange-100/60">{customer.email}</p>
                    <p className="mt-0.5 ml-2 text-xs text-orange-100/60">{customer.phone}</p>
                  </div>
                </div>

                <StatusBadge status={customer.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-orange-900/30 bg-orange-950/20 p-5">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-orange-400/60 mb-3">
                    <MailIcon className="h-4 w-4 text-orange-400/80" />
                    Email address
                  </div>
                  <p className="text-sm font-semibold text-white">{customer.email}</p>
                </div>
                <div className="rounded-3xl border border-orange-900/30 bg-orange-950/20 p-5">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-orange-400/60 mb-3">
                    <PhoneIcon className="h-4 w-4 ml-2 text-orange-400/80" />
                    Phone number
                  </div>
                  <p className="text-sm font-semibold text-white">{customer.phone}</p>
                </div>
                <div className="rounded-3xl border border-orange-900/30 bg-orange-950/20 p-5">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-orange-400/60 mb-3">
                    <CalendarIcon className="h-4 w-4 text-orange-400/80" />
                    Joined date
                  </div>
                  <p className="text-sm font-semibold text-white">{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="rounded-3xl border border-orange-900/30 bg-orange-950/20 p-5">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-orange-400/60 mb-3">
                    <PeopleIcon className="h-4 w-4 text-orange-400/80" />
                    Account role
                  </div>
                  <p className="text-sm font-semibold text-white">Customer</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-orange-900/40 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
              <div className="mb-5">
                <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/70">Account actions</p>
                <p className="mt-2 text-sm leading-relaxed text-orange-100/70">
                  Update the customer status and keep account access aligned with your policies.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="customer-status" className="block text-xs uppercase tracking-[0.3em] text-orange-400/70">Status</label>
                  <select
                    id="customer-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-orange-900/30 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                  >
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="blocked">blocked</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-900/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-500/50 hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving status…' : 'Save status'}
                </button>

                {requestError && (
                  <p className="text-sm text-rose-300">{requestError}</p>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
