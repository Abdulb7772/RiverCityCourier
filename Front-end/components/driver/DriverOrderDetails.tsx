'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAssignedOrder, updateOrderStatus, type DriverOrder } from '@/lib/driver-orders';

const statusStyles: Record<string, { badge: string; accent: string }> = {
  accepted:              { badge: 'border-sky-500/40 bg-sky-500/10 text-sky-300',          accent: 'bg-sky-400' },
  arrived_at_pickup:     { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',    accent: 'bg-amber-400' },
  picked_up:             { badge: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300', accent: 'bg-indigo-400' },
  in_transit:            { badge: 'border-violet-500/40 bg-violet-500/10 text-violet-300', accent: 'bg-violet-400' },
  arrived_at_destination:{ badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',       accent: 'bg-cyan-400' },
  completed:             { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', accent: 'bg-emerald-400' },
};

const statusLabel: Record<string, string> = {
  accepted: 'Assigned',
  arrived_at_pickup: 'In Progress',
  picked_up: 'In Progress',
  in_transit: 'In Progress',
  arrived_at_destination: 'In Progress',
  completed: 'Completed',
};

type Props = {
  orderId: string;
  userEmail: string;
  userName?: string | null;
  onBack: () => void;
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M16.5 9.4 7.55 4.24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 7.5h11v8H3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 10.5H18l2.5 2.5V15h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PriorityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12 2v20M12 2l4 4M12 2l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DriverOrderDetails({ orderId, userEmail, userName, onBack }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssignedOrder(orderId, userEmail)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId, userEmail]);

  useEffect(() => { load(); }, [load]);

  const handleStart = async () => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, 'in_transit', userEmail);
      router.push('/driver/orders/in-progress');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start order.');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-white/60">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20">
          <ArrowLeftIcon />
          Back to orders
        </button>
        <p className="text-sm text-rose-400">{error || 'Order not found.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20">
            <ArrowLeftIcon />
            Back to orders
          </button>
        </div>
        <h1 className="text-xl font-bold text-white font-mono tracking-tight">Order {order.orderNumber}</h1>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Status & Info card */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6 shadow-xl shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-orange-900/20">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-900/40 bg-orange-950/40">
                  <ActivityIcon />
                </span>
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Current status</p>
                  <p className="mt-0.5 text-xl font-semibold text-white leading-none">
                    {statusLabel[order.status] || order.status}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.7rem] font-semibold ${statusStyles[order.status]?.badge || 'border-white/20 bg-white/10 text-white/80'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[order.status]?.accent || 'bg-white/40'}`} />
                {statusLabel[order.status] || order.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Customer',    value: order.customer,    Icon: UserIcon },
                { label: 'Contact',     value: order.contact || '\u2014', Icon: PhoneIcon },
                { label: 'Pickup',      value: order.pickup,      Icon: MapPinIcon },
                { label: 'Destination', value: order.destination, Icon: NavigationIcon },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-start gap-3 rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                    <Icon />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.58rem] uppercase tracking-[0.3em] text-orange-400/55">{label}</p>
                    <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Delivery notes */}
          <article className="flex flex-1 flex-col rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <FileTextIcon />
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Delivery notes</p>
            </div>
            <p className="text-sm leading-relaxed text-orange-100/60">{order.note || 'No delivery notes.'}</p>
          </article>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Order summary */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <PackageIcon />
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Shipment details</p>
            </div>
            {[
              { label: 'Package Type', value: order.packageType || '\u2014', Icon: PackageIcon },
              { label: 'Priority', value: order.priority, Icon: PriorityIcon },
              { label: 'ETA', value: order.eta || '\u2014', Icon: ClockIcon },
              { label: 'Distance', value: order.distance || '\u2014', Icon: RulerIcon },
              { label: 'Payment', value: order.paymentMethod + (order.paymentMethod === 'cash' || order.paymentMethod === 'cash_on_delivery' ? order.codAmount ? ` ($${order.codAmount.toFixed(2)})` : '' : ''), Icon: CreditCardIcon },
              { label: 'Assigned Driver', value: order.assignedDriver, Icon: TruckIcon },
              { label: 'Pickup Date', value: order.pickupDate || '\u2014', Icon: ClockIcon },
              { label: 'Pickup Time', value: order.pickupTime || '\u2014', Icon: ClockIcon },
              { label: 'Delivery Date', value: order.deliveryDate || '\u2014', Icon: ClockIcon },
              { label: 'Delivery Time', value: order.deliveryTime || '\u2014', Icon: ClockIcon },
            ].map(({ label, value, Icon }, i, arr) => (
              <div key={label} className={`flex items-center justify-between gap-6 py-3.5 ${i < arr.length - 1 ? 'border-b border-orange-900/20' : ''}`}>
                <span className="flex items-center gap-2.5 text-sm text-orange-100/50">
                  <Icon />
                  {label}
                </span>
                <span className="text-sm font-semibold text-white text-right">{value}</span>
              </div>
            ))}
          </article>

          {/* Pickup Details */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <MapPinIcon />
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
                <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Location</p>
                <p className="mt-1 text-sm font-medium text-white">{order.pickup || '\u2014'}</p>
              </div>
            </div>
          </article>

          {/* Delivery Details */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <NavigationIcon />
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
                <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Location</p>
                <p className="mt-1 text-sm font-medium text-white">{order.destination || '\u2014'}</p>
              </div>
            </div>
          </article>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-5">
                <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                  <ClockIcon />
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

          {order.status === 'accepted' ? (
            <button
              type="button"
              disabled={updating}
              onClick={handleStart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? 'Starting...' : 'Start Order'}
            </button>
          ) : order.status !== 'completed' ? (
            <p className="text-center text-sm text-orange-100/50">
              This order is already in progress. Continue it from the In Progress page.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
