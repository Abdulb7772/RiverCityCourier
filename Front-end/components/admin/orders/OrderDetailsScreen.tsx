'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { AdminOrder, persistOrders, updateOrderStatus, assignDriverToOrder, fetchDrivers, fetchOrder, type Driver } from '@/lib/admin-orders';

// ── Icons ─────────────────────────────────────────────────────────────────
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
function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function NavigationIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PackageIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M16.5 9.4 7.55 4.24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
function RulerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function CreditCardIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
function XCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
function ZapIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Status config ─────────────────────────────────────────────────────────
const statusStyles: Record<AdminOrder['status'], { badge: string; accent: string }> = {
  new:        { badge: 'border-sky-500/40 bg-sky-500/10 text-sky-300',          accent: 'bg-sky-400' },
  processing: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',    accent: 'bg-amber-400' },
  picked_up:  { badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300', accent: 'bg-indigo-400' },
  completed:  { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', accent: 'bg-emerald-400' },
  rejected:   { badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300',       accent: 'bg-rose-400' },
};

const statusLabel: Record<AdminOrder['status'], string> = {
  new: 'New', processing: 'Processing', picked_up: 'Picked Up',
  completed: 'Completed', rejected: 'Rejected',
};

const summaryMeta = [
  { key: 'packageType',    label: 'Type',     Icon: PackageIcon },
  { key: 'assignedDriver', label: 'Driver',   Icon: TruckIcon },
  { key: 'eta',            label: 'ETA',      Icon: ClockIcon },
  { key: 'distance',       label: 'Distance', Icon: RulerIcon },
  { key: 'paymentMethod',  label: 'Payment',  Icon: CreditCardIcon },
] as const;

// ── Component ─────────────────────────────────────────────────────────────
type OrderDetailsScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

export function OrderDetailsScreen({ userEmail, userName }: OrderDetailsScreenProps) {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Orders');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ pickup: '', destination: '' });

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => { setOrders([data]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);
  useEffect(() => { fetchDrivers().then(setDrivers).catch(() => {}); }, []);

  const order = useMemo(() => orders.find((o) => o.id === orderId) ?? null, [orders, orderId]);

  useEffect(() => {
    if (order) setForm({ pickup: order.pickup, destination: order.destination });
  }, [order]);

  const handleReject = async () => {
    if (!order || (order.status !== 'new' && order.status !== 'processing')) return;
    try {
      const updated = await updateOrderStatus(orders, order.id, 'rejected');
      setOrders(updated);
      persistOrders(updated);
    } catch {
      // ignore
    }
  };

  const handleAssignDriver = async (driverEmail: string) => {
    if (!order) return;
    setAssigningDriver(true);
    try {
      const updated = await assignDriverToOrder(order.id, driverEmail);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated, assignedDriver: updated.assignedDriver || driverEmail } : o)));
    } catch {
      // ignore
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleSidebarSelect = (item: string) => {
    setActiveSection(item);
    router.push(item === 'Dashboard' ? '/admin' : item === 'Orders' ? '/admin/orders' : item === 'Support' ? '/admin/support' : '/admin');
  };

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const canReject = order?.status === 'new' || order?.status === 'processing';

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Review order details and manage rejections before the pickup phase."
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

      {/* 
        KEY FIX: w-full + no max-w constraint so it stretches edge-to-edge.
        Generous px so content breathes against the viewport edges.
      */}
      <main className="relative z-10 flex flex-1 flex-col w-full gap-6 px-6 py-8 sm:px-8 lg:px-12">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.45em] text-orange-400/60">Order detail</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {order ? order.orderNumber : 'Loading....'}
            </h1>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20 active:scale-95"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to orders
          </Link>
        </div>

        {/* ── Not found ── */}
        {loading ? (
          <section className="flex flex-1 items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 p-16">
            <p className="text-sm text-orange-100/50">Loading order details...</p>
          </section>
        ) : !order ? (
          <section className="flex flex-1 items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 p-16">
            <div className="text-center">
              <XCircleIcon className="mx-auto mb-4 h-10 w-10 text-orange-500/40" />
              <p className="text-sm text-orange-100/50">The requested order could not be found.</p>
            </div>
          </section>
        ) : (
          /* 
            KEY FIX: grid-cols-2 at lg, each col taking equal 1fr space.
            This fills the full width instead of being squeezed.
          */
          <section className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ══ LEFT COLUMN ══ */}
            <div className="flex flex-col gap-6">

              {/* Status card */}
              <article className="border border-orange-900/40 bg-slate-950/60 p-6 shadow-xl shadow-black/30">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-orange-900/20">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center border border-orange-900/40 bg-orange-950/40">
                      <ActivityIcon className="h-4 w-4 text-orange-400/80" />
                    </span>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Current status</p>
                      <p className="mt-0.5 text-xl font-semibold text-white leading-none">{statusLabel[order.status] || order.status}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 border px-3.5 py-1.5 text-[0.7rem] font-semibold ${statusStyles[order.status]?.badge || 'border-white/20 bg-white/10 text-white/80'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[order.status]?.accent || 'bg-white/40'}`} />
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Customer', value: order.customer, Icon: UserIcon },
                    { label: 'Contact', value: order.contact || '\u2014', Icon: PhoneIcon },
                    { label: 'Pickup', value: editing ? null : order.pickup, Icon: MapPinIcon },
                    { label: 'Destination', value: editing ? null : order.destination, Icon: NavigationIcon },
                  ].map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-start gap-3 border border-orange-900/25 bg-orange-950/15 p-4">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                        <Icon className="h-3 w-3 text-orange-400/70" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.58rem] uppercase tracking-[0.3em] text-orange-400/55">{label}</p>
                        {editing && (label === 'Pickup') ? (
                          <input type="text" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-2 py-1.5 text-sm text-white outline-none transition focus:border-orange-500/50" />
                        ) : editing && (label === 'Destination') ? (
                          <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-2 py-1.5 text-sm text-white outline-none transition focus:border-orange-500/50" />
                        ) : (
                          <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Pickup Details */}
              <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <MapPinIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Pickup Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Name</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupName || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Contact</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupContact || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Items</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupItems || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Quantity</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupQuantity || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Vehicle</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupVehicleType || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Pickup Date</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupDate || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Pickup Time</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.pickupTime || '\u2014'}</p>
                  </div>
                </div>
              </article>

              {/* Delivery Details */}
              <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <NavigationIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Delivery Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Name</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryName || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Contact</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryContact || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Items</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryItems || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Quantity</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryQuantity || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Vehicle</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryVehicleType || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Delivery Date</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryDate || '\u2014'}</p>
                  </div>
                  <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-3">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Delivery Time</p>
                    <p className="mt-1 text-sm font-medium text-white">{order.deliveryTime || '\u2014'}</p>
                  </div>
                </div>
              </article>

              {/* Driver Photos */}
              {(order.pickupPhotos?.length > 0 || order.deliveryPhoto) && (
                <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                  <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                      <PackageIcon className="h-3 w-3 text-orange-400/70" />
                    </span>
                    <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Driver Photos</p>
                  </div>
                  {order.pickupPhotos?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55 mb-2">Pickup Photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {order.pickupPhotos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block border border-orange-900/30 bg-orange-950/20 p-1">
                            <img src={url} alt={`Pickup ${i + 1}`} className="h-20 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {order.deliveryPhoto && (
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55 mb-2">Delivery Photo</p>
                      <a href={order.deliveryPhoto} target="_blank" rel="noopener noreferrer" className="block border border-orange-900/30 bg-orange-950/20 p-1 w-1/2">
                        <img src={order.deliveryPhoto} alt="Delivery" className="h-24 w-full object-cover" />
                      </a>
                    </div>
                  )}
                </article>
              )}

              {/* Delivery notes */}
              <article className="flex flex-1 flex-col rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <FileTextIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Delivery notes</p>
                </div>
                <p className="text-sm leading-relaxed text-orange-100/60">{order.note}</p>
              </article>
            </div>

            {/* ══ RIGHT COLUMN ══ */}
            <div className="flex flex-col gap-6">

              {/* Order summary */}
              <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <PackageIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Order summary</p>
                </div>
                {summaryMeta.map(({ key, label, Icon }, i) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-6 py-3.5 ${i < summaryMeta.length - 1 ? 'border-b border-orange-900/20' : ''}`}
                  >
                    <span className="flex items-center gap-2.5 text-sm text-orange-100/50">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-orange-400/50" />
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-white">{order[key]}</span>
                  </div>
                ))}
              </article>

              {/* Timeline */}
              <article className="rounded-lg border border-orange-900/40 gap-6 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-5">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <ClockIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Timeline</p>
                </div>
                <ol className="border-l border-orange-900/30 pl-6 space-y-5">
                  {order.timeline.map((item, idx) => (
                    <li key={idx} className="flex flex-col gap-1.5 pl-3">
                      <p className={`text-sm leading-relaxed ${idx === order.timeline.length - 1 ? 'text-white font-medium' : 'text-orange-100/60'}`}>{item}</p>
                    </li>
                  ))}
                </ol>
              </article>

              {/* Actions */}
              <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <ZapIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Actions</p>
                </div>

                {/* Driver assignment */}
                <div className="mb-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55 mb-2">Assign Driver</p>
                  <div className="flex gap-2">
                    <select
                      value={
                        order.assignedDriver && drivers.some((d) => d.email === order.assignedDriver)
                          ? order.assignedDriver
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) handleAssignDriver(e.target.value);
                      }}
                      disabled={assigningDriver}
                      className="flex-1 border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                    >
                      <option value="" className="bg-[#1a0800]">{assigningDriver ? 'Assigning...' : drivers.length ? 'Select a driver...' : 'No drivers available'}</option>
                      {drivers.filter((d) => d.verified).map((d) => (
                        <option key={d.id} value={d.email} className="bg-[#1a0800]">{d.fullName} ({d.email})</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1.5 text-xs text-orange-400/50">Current: {order.assignedDriver || 'Unassigned'}</p>
                </div>

                {canReject ? (
                  <button
                    type="button"
                    onClick={handleReject}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20 active:scale-[0.98]"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject this order
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-md border border-slate-700/40 bg-slate-900/50 px-5 py-3.5 text-sm text-slate-400">
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Order can no longer be rejected after the pickup stage.</span>
                  </div>
                )}
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}