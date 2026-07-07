'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerOrder, fetchCustomerOrder, updateCustomerOrderStatus, updateCustomerOrder } from '@/lib/customer-orders';

const statusStyles: Record<string, { badge: string; accent: string }> = {
  new: { badge: 'border-sky-500/40 bg-sky-500/10 text-sky-300', accent: 'bg-sky-400' },
  accepted: { badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300', accent: 'bg-blue-400' },
  arrived_at_pickup: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', accent: 'bg-amber-400' },
  picked_up: { badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300', accent: 'bg-indigo-400' },
  in_transit: { badge: 'border-violet-500/40 bg-violet-500/10 text-violet-300', accent: 'bg-violet-400' },
  arrived_at_destination: { badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', accent: 'bg-cyan-400' },
  completed: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', accent: 'bg-emerald-400' },
  rejected: { badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300', accent: 'bg-rose-400' },
};

const statusLabel: Record<string, string> = {
  new: 'New',
  accepted: 'Assigned',
  arrived_at_pickup: 'Arrived',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  arrived_at_destination: 'Arrived',
  completed: 'Completed',
  rejected: 'Cancelled',
};

function ArrowLeftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }
function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>); }
function NavigationIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function PackageIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M16.5 9.4 7.55 4.24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function TruckIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M3.5 7.5h11v8H3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M14.5 10.5H18l2.5 2.5V15h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="17.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>); }
function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function RulerIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }
function CreditCardIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M2 10h20" stroke="currentColor" strokeWidth="1.7" /><path d="M6 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }
function FileTextIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }
function ActivityIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function XCircleIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" /><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }
function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" /><path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function EditIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function SaveIcon({ className = 'h-4 w-4' }: { className?: string }) { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

const summaryMeta = [
  { key: 'packageType', label: 'Type', Icon: PackageIcon },
  { key: 'assignedDriver', label: 'Driver', Icon: TruckIcon },
  { key: 'eta', label: 'ETA', Icon: ClockIcon },
  { key: 'distance', label: 'Distance', Icon: RulerIcon },
  { key: 'paymentMethod', label: 'Payment', Icon: CreditCardIcon },
] as const;

type Props = {
  orderId: string;
  userEmail?: string | null;
  userName?: string | null;
};

export function CustomerOrderDetail({ orderId, userEmail, userName }: Props) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Active Deliveries');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/customer', 'Create Delivery': '/customer/create-delivery',
        'Active Deliveries': '/customer/orders', 'Delivery History': '/customer/orders/history', 'Saved Addresses': '/customer/saved-locations',
        Profile: '/customer/profile', Support: '/customer/support',
      };
      router.push(paths[item] || '/customer');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const load = useCallback(() => {
    setLoading(true);
    fetchCustomerOrder(orderId)
      .then((data) => {
        setOrder(data);
        setForm({
          pickupName: data.pickupName || '',
          pickupContact: data.pickupContact || '',
          pickupItems: data.pickupItems || '',
          pickupQuantity: data.pickupQuantity || '',
          pickupVehicleType: data.pickupVehicleType || '',
          pickup: data.pickup || '',
          pickupDate: data.pickupDate || '',
          pickupTime: data.pickupTime || '',
          deliveryName: data.deliveryName || '',
          deliveryContact: data.deliveryContact || '',
          deliveryItems: data.deliveryItems || '',
          deliveryQuantity: data.deliveryQuantity || '',
          deliveryVehicleType: data.deliveryVehicleType || '',
          destination: data.destination || '',
          deliveryDate: data.deliveryDate || '',
          deliveryTime: data.deliveryTime || '',
          note: data.note || '',
          contact: data.contact || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const isAssigned = order?.assignedDriver && order.assignedDriver !== 'Unassigned';
  const canEdit = !isAssigned && order?.status !== 'completed' && order?.status !== 'rejected';

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    setForm({
      pickupName: order?.pickupName || '',
      pickupContact: order?.pickupContact || '',
      pickupItems: order?.pickupItems || '',
      pickupQuantity: order?.pickupQuantity || '',
      pickupVehicleType: order?.pickupVehicleType || '',
      pickup: order?.pickup || '',
      pickupDate: order?.pickupDate || '',
      pickupTime: order?.pickupTime || '',
      deliveryName: order?.deliveryName || '',
      deliveryContact: order?.deliveryContact || '',
      deliveryItems: order?.deliveryItems || '',
      deliveryQuantity: order?.deliveryQuantity || '',
      deliveryVehicleType: order?.deliveryVehicleType || '',
      destination: order?.destination || '',
      deliveryDate: order?.deliveryDate || '',
      deliveryTime: order?.deliveryTime || '',
      note: order?.note || '',
      contact: order?.contact || '',
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updateCustomerOrder(order.id, {
        pickupName: form.pickupName,
        pickupContact: form.pickupContact,
        pickupItems: form.pickupItems,
        pickupQuantity: form.pickupQuantity,
        pickupVehicleType: form.pickupVehicleType,
        pickup: form.pickup,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        deliveryName: form.deliveryName,
        deliveryContact: form.deliveryContact,
        deliveryItems: form.deliveryItems,
        deliveryQuantity: form.deliveryQuantity,
        deliveryVehicleType: form.deliveryVehicleType,
        destination: form.destination,
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        note: form.note,
        contact: form.contact,
      });
      setOrder(updated);
      setEditing(false);
      toast.success('Order updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await updateCustomerOrderStatus(order.id, 'rejected');
      setOrder(updated);
      toast.success('Order cancelled.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const editableFields = (label: string, key: string) => (
    editing ? (
      <input
        type="text"
        value={form[key] || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-2 py-1.5 text-sm text-white outline-none transition focus:border-orange-500/50"
      />
    ) : null
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <CustomerNavbar
        userEmail={userEmail}
        userName={userName}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        activeItem={activeSection}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="relative z-10 flex flex-1 flex-col w-full gap-6 px-6 py-8 sm:px-8 lg:px-12">

        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.45em] text-orange-400/60">Order detail</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {order ? order.orderNumber : 'Loading....'}
            </h1>
          </div>
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20 active:scale-95"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to orders
          </Link>
        </div>

        {loading ? (
          <section className="flex flex-1 items-center justify-center border border-orange-900/40 bg-slate-950/60 p-16">
            <p className="text-sm text-orange-100/50">Loading order details...</p>
          </section>
        ) : !order ? (
          <section className="flex flex-1 items-center justify-center border border-orange-900/40 bg-slate-950/60 p-16">
            <div className="text-center">
              <XCircleIcon className="mx-auto mb-4 h-10 w-10 text-orange-500/40" />
              <p className="text-sm text-orange-100/50">The requested order could not be found.</p>
            </div>
          </section>
        ) : (
          <section className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">

            {/* LEFT COLUMN */}
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
                    { label: 'Customer', value: order.customerEmail, Icon: UserIcon },
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
              <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <MapPinIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Pickup Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', key: 'pickupName' },
                    { label: 'Contact', key: 'pickupContact' },
                    { label: 'Items', key: 'pickupItems' },
                    { label: 'Quantity', key: 'pickupQuantity' },
                    { label: 'Vehicle', key: 'pickupVehicleType' },
                    { label: 'Pickup Date', key: 'pickupDate' },
                    { label: 'Pickup Time', key: 'pickupTime' },
                  ].map(({ label, key }) => (
                    <div key={key} className="border border-orange-900/25 bg-orange-950/15 p-3">
                      <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">{label}</p>
                      {editing ? (
                        <input type="text" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-2 py-1.5 text-sm text-white outline-none transition focus:border-orange-500/50" />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-white">{(order as any)[key] || '\u2014'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>

              {/* Delivery Details */}
              <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <NavigationIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Delivery Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', key: 'deliveryName' },
                    { label: 'Contact', key: 'deliveryContact' },
                    { label: 'Items', key: 'deliveryItems' },
                    { label: 'Quantity', key: 'deliveryQuantity' },
                    { label: 'Vehicle', key: 'deliveryVehicleType' },
                    { label: 'Delivery Date', key: 'deliveryDate' },
                    { label: 'Delivery Time', key: 'deliveryTime' },
                  ].map(({ label, key }) => (
                    <div key={key} className="border border-orange-900/25 bg-orange-950/15 p-3">
                      <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">{label}</p>
                      {editing ? (
                        <input type="text" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-2 py-1.5 text-sm text-white outline-none transition focus:border-orange-500/50" />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-white">{(order as any)[key] || '\u2014'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>

              {/* Photos */}
              {(order.pickupPhotos?.length > 0 || order.deliveryPhoto) && (
                <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                  <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
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

              {/* Notes */}
              {(!editing || true) && (
                <article className="flex flex-1 flex-col border border-orange-900/40 bg-slate-950/60 p-6">
                  <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                      <FileTextIcon className="h-3 w-3 text-orange-400/70" />
                    </span>
                    <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Delivery notes</p>
                  </div>
                  {editing ? (
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      rows={3}
                      className="w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-orange-100/60">{order.note || 'No delivery notes.'}</p>
                  )}
                </article>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6">

              {/* Order summary */}
              <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <PackageIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Order summary</p>
                </div>
                {summaryMeta.map(({ key, label, Icon }, i) => (
                  <div key={key} className={`flex items-center justify-between gap-6 py-3.5 ${i < summaryMeta.length - 1 ? 'border-b border-orange-900/20' : ''}`}>
                    <span className="flex items-center gap-2.5 text-sm text-orange-100/50">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-orange-400/50" />
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-white text-right">{(order as any)[key] || '\u2014'}</span>
                  </div>
                ))}
              </article>

              {/* Timeline */}
              {order.timeline && order.timeline.length > 0 && (
                <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                  <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-5">
                    <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                      <ClockIcon className="h-3 w-3 text-orange-400/70" />
                    </span>
                    <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Timeline</p>
                  </div>
                  <ol className="border-l border-orange-900/30 pl-6 space-y-5">
                    {order.timeline.map((item, idx) => (
                      <li key={item} className="flex flex-col gap-1.5 pl-3">
                        <p className={`text-sm leading-relaxed ${idx === order.timeline.length - 1 ? 'text-white font-medium' : 'text-orange-100/60'}`}>{item}</p>
                      </li>
                    ))}
                  </ol>
                </article>
              )}

              {/* Actions */}
              <article className="border border-orange-900/40 bg-slate-950/60 p-6">
                <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center border border-orange-900/30 bg-orange-950/40">
                    <ActivityIcon className="h-3 w-3 text-orange-400/70" />
                  </span>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Actions</p>
                </div>

                {/* Edit Section */}
                {canEdit && !editing && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="mb-3 inline-flex w-full items-center justify-center gap-2 border border-sky-500/30 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-400/50 hover:bg-sky-500/20 active:scale-[0.98]"
                  >
                    <EditIcon className="h-4 w-4" />
                    Edit Order Details
                  </button>
                )}

                {canEdit && editing && (
                  <div className="mb-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:opacity-50 active:scale-[0.98]"
                    >
                      <SaveIcon className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-orange-800/40 px-5 py-3 text-sm text-orange-300/70 transition hover:border-orange-500/50 hover:text-orange-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {isAssigned && (
                  <div className="mb-3 flex items-center gap-3 border border-slate-700/40 bg-slate-900/50 px-5 py-3.5 text-sm text-slate-400">
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Order has been assigned to a driver. Details can no longer be modified.</span>
                  </div>
                )}

                {/* Cancel order */}
                {(order.status === 'new') && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelOrder}
                    className="inline-flex w-full items-center justify-center gap-2 border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    {cancelling ? 'Cancelling...' : 'Cancel this Order'}
                  </button>
                )}

                {order.status === 'completed' && (
                  <div className="flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200">
                    <CheckCircleIcon className="h-4 w-4" />
                    This order has been completed
                  </div>
                )}

                {order.status === 'rejected' && (
                  <div className="flex items-center justify-center gap-2 border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200">
                    <XCircleIcon className="h-4 w-4" />
                    This order has been cancelled
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
