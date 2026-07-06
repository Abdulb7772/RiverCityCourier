'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { AdminDriver, fetchDriver, unverifyDriver } from '@/lib/admin-drivers';
import { fetchDriverVerification, updateDocumentStatus, type DriverVerification, type VerificationDocument } from '@/lib/admin-verification';

function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function FileTextIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ActivityIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CreditCardIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function DriverDetailsScreen({ userEmail, userName }: { userEmail?: string | null; userName?: string | null }) {
  const params = useParams();
  const router = useRouter();
  const driverId = params.driverId as string;
  const [driver, setDriver] = useState<AdminDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');

  const [verification, setVerification] = useState<DriverVerification | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadDriver() {
      try {
        const fetchedDriver = await fetchDriver(driverId);
        if (isMounted) setDriver(fetchedDriver);
      } catch (error) {
        if (isMounted) setRequestError(error instanceof Error ? error.message : 'Unable to load driver.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (driverId) loadDriver();
    return () => { isMounted = false; };
  }, [driverId]);

  useEffect(() => {
    if (!driver?.email) return;
    let isMounted = true;
    fetchDriverVerification(driver.email)
      .then((data) => { if (isMounted) setVerification(data); })
      .catch(() => { if (isMounted) setVerification(null); });
    return () => { isMounted = false; };
  }, [driver?.email]);

  const handleApproveDoc = async (doc: VerificationDocument) => {
    if (!driver) return;
    try {
      const result = await updateDocumentStatus(driver.email, doc.type, 'verified');
      setVerification(result);
      if (result.status === 'verified' && !driver.verified) {
        const updatedDriver = await fetchDriver(driverId);
        setDriver(updatedDriver);
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to approve document.');
    }
  };

  const handleRejectDoc = async (doc: VerificationDocument) => {
    if (!driver || !rejectComment.trim()) return;
    try {
      const result = await updateDocumentStatus(driver.email, doc.type, 'rejected', rejectComment.trim());
      setVerification(result);
      setRejecting(null);
      setRejectComment('');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to reject document.');
    }
  };

  const documentLabels: Record<string, string> = {
    license: 'Driver License',
    identification: 'Identification Card',
    insurance: 'Proof of Insurance',
    picture: 'Profile Picture',
    vehicle_photo: 'Vehicle Photo',
    vehicle_registration: 'Vehicle Registration',
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Review an individual driver profile, uploaded documents, and verification history."
        onMenuClick={() => {}}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <AdminSidebar
        isOpen={false}
        activeSection="Drivers"
        items={adminSidebarItems}
        onSelect={() => {}}
        onClose={() => {}}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <main className="relative z-10 flex flex-1 flex-col w-full gap-5 px-6 py-6 sm:px-8 lg:px-10">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.45em] text-orange-400/60">Driver details</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {driver ? driver.fullName : loading ? 'Loading...' : 'Driver not found'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/drivers')}
            className="inline-flex items-center gap-2 rounded border border-orange-500/30 bg-orange-500/10 px-3.5 py-2 text-xs font-medium text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20 active:scale-95"
          >
            <ArrowLeftIcon className="h-3 w-3" />
            Back to drivers
          </button>
        </div>

        {loading ? (
          <section className="flex flex-1 items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 p-16 text-sm text-orange-100/70">
            Loading driver profile...
          </section>
        ) : !driver ? (
          <section className="flex flex-1 items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 p-16 text-center text-sm text-orange-100/60">
            The requested driver could not be found.
          </section>
        ) : (
          <>
            {/* TOP ROW: Awaiting Verification card + Verified Drivers stats */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Awaiting Verification */}
              <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Awaiting verification</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-semibold ${driver.verified ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${driver.verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {driver.verified ? 'Active' : 'Pending'}
                  </span>
                </div>

                {/* Driver profile row */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-orange-900/30 bg-orange-950/20 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-950/60 text-orange-300 text-lg font-bold">
                    {driver.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm">{driver.fullName}</p>
                    <p className="text-xs text-orange-100/60 mt-0.5">{driver.email}</p>
                    <p className="text-xs text-orange-100/60">{driver.phone}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold ${driver.verified ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${driver.verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {driver.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg border border-orange-900/30 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/60">Joined</p>
                    <p className="mt-1 text-sm font-semibold text-white">{new Date(driver.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-lg border border-orange-900/30 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/60">Role</p>
                    <p className="mt-1 text-sm font-semibold text-white">Driver</p>
                  </div>
                </div>

                {driver.verified && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const updated = await unverifyDriver(driver.id);
                        setDriver(updated);
                      } catch (error) {
                        setRequestError(error instanceof Error ? error.message : 'Unable to unverify driver.');
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                  >
                    Unverify driver
                  </button>
                )}
                {requestError && <p className="mt-3 text-xs text-rose-300">{requestError}</p>}
              </article>

              {/* Verified Drivers stats */}
              <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5 shadow-xl shadow-black/30">
                <div className="mb-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Verified drivers</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total trips', value: '24' },
                    { label: 'Rating', value: '18' },
                    { label: 'Personal', value: '6' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-orange-900/30 bg-orange-950/20 p-3 text-center">
                      <p className="text-xl font-bold text-white">{s.value}</p>
                      <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.25em] text-orange-400/60">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Driver history mini list */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                      <ActivityIcon className="h-3 w-3 text-orange-400/70" />
                    </span>
                    <p className="text-[0.55rem] uppercase tracking-[0.35em] text-orange-400/60">Driver history</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Account created', value: driver.createdAt },
                      { label: 'Verification status', value: driver.verified ? 'Verified by admin' : 'Pending review' },
                      { label: 'Live tracking', value: 'Ready to enable soon' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-orange-900/20 bg-orange-950/10 px-3 py-2 text-xs">
                        <span className="text-orange-100/60">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            {/* MIDDLE ROW: Driver Profile + Documents + History + Transaction */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Driver Profile */}
              <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <UserIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.55rem] uppercase tracking-[0.4em] text-orange-400/60">Driver profile</p>
                </div>

                <div className="flex flex-col items-center text-center mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-500/40 bg-orange-950/60 text-2xl font-bold text-orange-300 mb-3">
                    {driver.fullName.charAt(0)}
                  </div>
                  <p className="font-semibold text-white">{driver.fullName}</p>
                  <p className="text-xs text-orange-100/50 mt-0.5">{driver.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <StarIcon className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-amber-300 font-medium">4.8</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Phone', value: driver.phone },
                    { label: 'Email', value: driver.email },
                    { label: 'Joined', value: new Date(driver.createdAt).toLocaleDateString() },
                    { label: 'Status', value: driver.verified ? 'Verified' : 'Pending' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-orange-900/20 bg-orange-950/10 px-3 py-2.5">
                      <p className="text-[0.55rem] uppercase tracking-[0.25em] text-orange-400/50">{item.label}</p>
                      <p className="mt-0.5 text-xs font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* Documents Uploaded */}
              <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <FileTextIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.55rem] uppercase tracking-[0.4em] text-orange-400/60">Documents uploaded</p>
                </div>
                {!verification || verification.documents.length === 0 ? (
                  <div className="rounded-lg border border-orange-900/20 bg-orange-950/10 px-4 py-6 text-center text-xs text-orange-100/50">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verification.documents.map((doc) => (
                      <div key={doc.type} className="rounded-lg border border-orange-900/20 bg-orange-950/10 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white">{documentLabels[doc.type] || doc.type}</p>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[0.6rem] text-orange-400/60 underline hover:text-orange-300">View file</a>
                            )}
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold ${
                            doc.status === 'verified' ? 'bg-emerald-500/15 text-emerald-300' :
                            doc.status === 'rejected' ? 'bg-rose-500/15 text-rose-300' :
                            'bg-amber-500/15 text-amber-300'
                          }`}>
                            {doc.status === 'verified' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                        {doc.comment && (
                          <div className="mt-2 rounded border border-orange-900/20 bg-orange-950/20 px-2.5 py-1.5">
                            <p className="text-[0.5rem] uppercase tracking-wider text-orange-400/50">Reason</p>
                            <p className="mt-0.5 text-xs text-orange-200/80">{doc.comment}</p>
                          </div>
                        )}
                        {doc.status === 'pending' && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => handleApproveDoc(doc)} className="rounded border border-emerald-600/40 bg-emerald-950/30 px-3 py-1 text-[0.6rem] font-medium text-emerald-300 transition hover:border-emerald-500/60 hover:bg-emerald-900/50">Approve</button>
                            <button type="button" onClick={() => { setRejecting(rejecting === doc.type ? null : doc.type); setRejectComment(''); }} className="rounded border border-rose-600/40 bg-rose-950/30 px-3 py-1 text-[0.6rem] font-medium text-rose-300 transition hover:border-rose-500/60 hover:bg-rose-900/50">Reject</button>
                          </div>
                        )}
                        {rejecting === doc.type && (
                          <div className="mt-3 space-y-2">
                            <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Enter reason for rejection..." className="w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-xs text-white outline-none transition focus:border-orange-500/50 resize-none" rows={2} />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleRejectDoc(doc)} disabled={!rejectComment.trim()} className="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-1.5 text-[0.6rem] font-medium text-rose-200 transition hover:border-rose-500/60 hover:bg-rose-900/50 disabled:cursor-not-allowed disabled:opacity-50">Confirm Reject</button>
                              <button type="button" onClick={() => { setRejecting(null); setRejectComment(''); }} className="rounded border border-orange-700/40 bg-orange-950/30 px-3 py-1.5 text-[0.6rem] font-medium text-orange-200 transition hover:border-orange-500/60 hover:bg-orange-900/50">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-orange-900/20 pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                      <ActivityIcon className="h-2.5 w-2.5 text-orange-400/70" />
                    </span>
                    <p className="text-[0.55rem] uppercase tracking-[0.4em] text-orange-400/60">Assignments</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Total assignments', value: '12' },
                      { label: 'Completed', value: '10' },
                      { label: 'In progress', value: '2' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-orange-900/20 bg-orange-950/10 px-3 py-2 text-xs">
                        <span className="text-orange-100/60">{item.label}</span>
                        <span className="font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Transaction section */}
              <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <CreditCardIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.55rem] uppercase tracking-[0.4em] text-orange-400/60">Transaction section</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    { label: 'Total earned', value: '$1,240' },
                    { label: 'Withdrawals', value: '$980' },
                    { label: 'Pending', value: '$260' },
                    { label: 'Transactions', value: '2/5' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-orange-900/20 bg-orange-950/10 p-3">
                      <p className="text-[0.55rem] uppercase tracking-[0.2em] text-orange-400/50">{item.label}</p>
                      <p className="mt-1 text-base font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Last payout', value: 'Jun 20, 2025', status: 'Cleared' },
                    { label: 'Next payout', value: 'Jul 5, 2025', status: 'Scheduled' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-orange-900/20 bg-orange-950/10 px-3 py-2.5 text-xs">
                      <div>
                        <p className="text-[0.55rem] uppercase tracking-[0.2em] text-orange-400/50">{item.label}</p>
                        <p className="mt-0.5 font-medium text-white">{item.value}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${item.status === 'Cleared' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-blue-500/15 text-blue-300'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* BOTTOM: Live Location Feed - full width */}
            <article className="rounded-xl border border-orange-900/40 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between border-b border-orange-900/20 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <MapPinIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.55rem] uppercase tracking-[0.4em] text-orange-400/60">Live location feed</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[0.65rem] font-medium text-orange-200 transition hover:bg-orange-500/20"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                  Tracking map
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-orange-900/20 bg-orange-950/10 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.25em] text-orange-400/50">Coordinates</p>
                  <p className="mt-1.5 text-sm font-medium text-white font-mono">33.6844° N, 73.0479° E</p>
                  <p className="mt-0.5 text-[0.6rem] text-orange-100/40">Last updated: just now</p>
                </div>
                <div className="rounded-xl border border-orange-900/20 bg-orange-950/10 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.25em] text-orange-400/50">Last known route</p>
                  <p className="mt-1.5 text-sm font-medium text-white">Rawalpindi → Islamabad</p>
                  <p className="mt-0.5 text-[0.6rem] text-orange-100/40">Estimated: 22 min</p>
                </div>
                <div className="rounded-xl border border-orange-900/20 bg-orange-950/10 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.25em] text-orange-400/50">Last item</p>
                  <p className="mt-1.5 text-sm font-medium text-white">—</p>
                  <p className="mt-0.5 text-[0.6rem] text-orange-100/40">
                    Live feed will connect here once the driver&apos;s vehicle is online and the assignment is active.
                  </p>
                </div>
              </div>
            </article>
          </>
        )}
      </main>
    </div>
  );
}