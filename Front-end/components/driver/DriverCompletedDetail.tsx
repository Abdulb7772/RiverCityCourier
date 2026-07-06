'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchAssignedOrder, type DriverOrder } from '@/lib/driver-orders';

type Props = {
  orderId: string;
  userEmail: string;
  onBack: () => void;
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhotoGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setSelected(url)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-orange-900/30 bg-orange-950/20 transition hover:border-orange-500/50"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs text-white/0 transition group-hover:bg-black/30 group-hover:text-white/80">
              View
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img src={selected} alt="" className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}

export function DriverCompletedDetail({ orderId, userEmail, onBack }: Props) {
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
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
          Back to completed orders
        </button>
        <p className="text-sm text-rose-400">{error || 'Order not found.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20">
        <ArrowLeftIcon />
        Back to completed orders
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white font-mono tracking-tight">Order {order.orderNumber}</h1>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[0.7rem] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Completed
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <h2 className="mb-4 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Delivery info</h2>
            <div className="space-y-4">
              {[
                { label: 'Customer', value: order.customer },
                { label: 'Contact', value: order.contact || '\u2014' },
                { label: 'Pickup', value: order.pickup, Icon: MapPinIcon },
                { label: 'Destination', value: order.destination, Icon: NavigationIcon },
                { label: 'Package', value: order.packageType || '\u2014', Icon: PackageIcon },
                { label: 'Distance', value: order.distance || '\u2014' },
                { label: 'Pickup Date', value: order.pickupDate || '\u2014' },
                { label: 'Pickup Time', value: order.pickupTime || '\u2014' },
                { label: 'Delivery Date', value: order.deliveryDate || '\u2014' },
                { label: 'Delivery Time', value: order.deliveryTime || '\u2014' },
                { label: 'ETA at completion', value: order.eta || '\u2014' },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  {Icon && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                      <Icon />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-orange-400/50">{label}</p>
                    <p className="truncate text-sm font-medium text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {order.note && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <h2 className="mb-3 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Delivery notes</h2>
              <p className="text-sm leading-relaxed text-orange-100/60">{order.note}</p>
            </article>
          )}

          {order.timeline && order.timeline.length > 0 && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <h2 className="mb-4 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Timeline</h2>
              <ol className="border-l border-orange-900/30 pl-6 space-y-4">
                {order.timeline.map((item, idx) => (
                  <li key={item} className="pl-3">
                    <p className={`text-sm ${idx === order.timeline.length - 1 ? 'font-medium text-white' : 'text-orange-100/60'}`}>{item}</p>
                  </li>
                ))}
              </ol>
            </article>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {order.pickupPhotos.length > 0 && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                  <ImageIcon />
                </span>
                <h2 className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Pickup photos ({order.pickupPhotos.length})</h2>
              </div>
              <PhotoGallery images={order.pickupPhotos} />
            </article>
          )}

          {order.deliveryPhoto && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                  <CheckCircleIcon />
                </span>
                <h2 className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">Delivery photo</h2>
              </div>
              <PhotoGallery images={[order.deliveryPhoto]} />
            </article>
          )}

          {!order.pickupPhotos.length && !order.deliveryPhoto && (
            <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-800/30 bg-orange-950/30">
                  <ImageIcon />
                </span>
                <p className="text-sm text-orange-300/50">No photos were uploaded for this order.</p>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
