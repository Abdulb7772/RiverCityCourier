'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { AdminCustomer, fetchCustomers, updateCustomerStatus } from '@/lib/admin-customers';

type CustomersScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

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

export function CustomersScreen({ userEmail, userName }: CustomersScreenProps) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const limit = 5;

  const loadCustomers = useCallback((page: number) => {
    let mounted = true;
    setLoading(true);

    fetchCustomers(page, limit)
      .then((result) => {
        if (!mounted) return;
        setCustomers(result.data);
        setTotalPages(result.totalPages);
        setTotalCustomers(result.total);
      })
      .catch((error) => {
        if (!mounted) return;
        setRequestError(error instanceof Error ? error.message : 'Unable to load customers.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = loadCustomers(currentPage);
    return cleanup;
  }, [currentPage, loadCustomers]);

  const handleStatusChange = async (customerId: string, status: string) => {
    setRequestError('');
    setUpdatingId(customerId);

    try {
      const updated = await updateCustomerStatus(customerId, status);
      setCustomers((current) => current.map((customer) => (customer.id === customerId ? updated : customer)));
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to update customer status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetails = (customerId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/admin/customers/${customerId}`;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Review customer accounts, manage status, and keep customers active."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection="Customers"
        items={adminSidebarItems}
        onSelect={() => setIsSidebarOpen(false)}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <main className="relative z-10 flex w-full flex-1 flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/70">Customers</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Customer management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-orange-100/60">
              View all registered customers, update account status, and get a quick snapshot of the customer base.
            </p>
          </div>
          <div className="rounded-full border border-orange-900/40 bg-orange-950/20 px-4 py-3 text-sm text-orange-100/70">
            {totalCustomers} customers
          </div>
        </div>

        {requestError && (
          <div className="rounded-md border border-rose-600/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {requestError}
          </div>
        )}

        {loading ? (
          <div className="flex w-full flex-1 min-h-[280px] items-center justify-center rounded-3xl border border-orange-900/40 bg-slate-950/60 p-10 text-sm text-orange-100/70">
            Loading customers…
          </div>
        ) : customers.length === 0 ? (
          <div className="flex w-full flex-1 min-h-[280px] items-center justify-center rounded-3xl border border-orange-900/40 bg-slate-950/60 p-10 text-sm text-orange-100/70">
            No customers found.
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col gap-4">
            {customers.map((customer) => (
              <article key={customer.id} className="w-full rounded-3xl border border-orange-900/40 bg-slate-950/60 p-5 shadow-xl shadow-black/20">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-900/40 bg-orange-950/40 text-lg font-semibold text-orange-200">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{customer.fullName}</p>
                    <p className="mt-1 text-xs text-orange-100/60">{customer.email}</p>
                    <p className="mt-1 text-xs text-orange-100/60">{customer.phone}</p>
                  </div>
                  <StatusBadge status={customer.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-orange-900/30 bg-orange-950/20 p-4 text-sm text-orange-100/70">
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-orange-400/70">Joined</p>
                    <p className="mt-2 font-semibold text-white">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl border border-orange-900/30 bg-orange-950/20 p-4 text-sm text-orange-100/70">
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-orange-400/70">Role</p>
                    <p className="mt-2 font-semibold text-white">Customer</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <select
                    value={customer.status}
                    onChange={(event) => handleStatusChange(customer.id, event.target.value)}
                    disabled={updatingId === customer.id}
                    className="w-full rounded-2xl border border-orange-900/30 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-orange-500 sm:w-auto"
                  >
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="blocked">blocked</option>
                  </select>

                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(customer.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-orange-900/30 w-25 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-500/50 hover:bg-slate-900/80"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(customer.id, customer.status)}
                      disabled={updatingId === customer.id}
                      className="inline-flex items-center justify-center rounded-2xl border border-orange-900/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-500/50 hover:bg-orange-500/20 disabled:opacity-50"
                    >
                      {updatingId === customer.id ? 'Updating…' : 'Save status'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-4 border-t border-orange-900/30 pt-6">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-2xl border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-2xl border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
