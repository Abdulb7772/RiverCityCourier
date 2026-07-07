'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchActiveOrder,
  updateOrderStatus,
  updateOrderPhotos,
  updateOrderCodAmount,
  type DriverOrder,
} from '@/lib/driver-orders';
import { openCloudinaryWidget, isCloudinaryConfigured } from '@/lib/cloudinary-upload';

type Props = {
  userEmail: string;
};

const statusLabel: Record<string, string> = {
  accepted: 'Start',
  in_transit: 'Heading to Pickup',
  arrived_at_pickup: 'Arrived at Pickup',
  picked_up: 'Picked Up',
  arrived_at_destination: 'Arrived at Destination',
  completed: 'Delivered',
};

const flowSteps = [
  { key: 'in_transit', label: 'Head to Pickup' },
  { key: 'arrived_at_pickup', label: 'Arrive at Pickup' },
  { key: 'picked_up', label: 'Pick Up Order', needsPhotos: true },
  { key: 'arrived_at_destination', label: 'Arrive at Destination' },
  { key: 'completed', label: 'Deliver Order', needsPhotos: true },
];

export function DriverInProgressOrder({ userEmail }: Props) {
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchActiveOrder(userEmail)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

  useEffect(() => { load(); }, [load]);

  const currentStepIndex = order
    ? flowSteps.findIndex((s) => s.key === order.status)
    : -1;
  const currentStep = currentStepIndex >= 0 ? flowSteps[currentStepIndex] : null;
  const nextStep = currentStepIndex >= 0 && currentStepIndex < flowSteps.length - 1
    ? flowSteps[currentStepIndex + 1]
    : null;

  const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string>('');
  const [codAmount, setCodAmount] = useState<number>(0);

  useEffect(() => {
    if (order) {
      setPickupPhotos(order.pickupPhotos || []);
      setDeliveryPhoto(order.deliveryPhoto || '');
      setCodAmount(order.codAmount || 0);
    }
  }, [order]);

  const isCodOrder = order && (order.paymentMethod === 'cash' || order.paymentMethod === 'cash_on_delivery');

  const handleSimpleAction = async (nextStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      const updated = await updateOrderStatus(order.id, nextStatus, userEmail);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotosThenAction = async (nextStatus: string, photos: string[], field: string) => {
    if (!order || photos.length === 0) {
      setError('Please upload photos first.');
      return;
    }
    setUpdating(true);
    setError('');
    try {
      const photosData = field === 'deliveryPhoto' ? photos[0] : photos;
      await updateOrderPhotos(order.id, userEmail, field, photosData);
      const updated = await updateOrderStatus(order.id, nextStatus, userEmail);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadPickupPhotos = () => {
    const remaining = 3 - pickupPhotos.length;
    if (remaining <= 0) return;
    openCloudinaryWidget({
      maxFiles: remaining,
      onUpload: (url) => {
        setPickupPhotos((prev) => {
          const next = [...prev, url];
          return next;
        });
      },
      onError: (msg) => setError(msg),
    });
  };

  const handleUploadDeliveryPhoto = () => {
    openCloudinaryWidget({
      maxFiles: 1,
      onUpload: (url) => {
        setDeliveryPhoto(url);
      },
      onError: (msg) => setError(msg),
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/60">Loading active order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-orange-900/40 bg-slate-950/60 py-20">
          <p className="text-lg font-semibold text-white">No Active Order</p>
          <p className="mt-2 text-sm text-white/50">You dont have any order in progress right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Current Order</h1>
        <p className="mt-1 text-xs text-white/50">Order {order.orderNumber}</p>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LEFT COLUMN - Order Details */}
        <div className="flex flex-col gap-6">

          {/* Order Info */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-orange-400/70">
                  <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Order details</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                <div className="min-w-0">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Customer</p>
                  <p className="mt-1 text-sm font-medium text-white">{order.customer}</p>
                  <p className="text-xs text-white/60">{order.contact}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Package</p>
                  <p className="mt-1 text-sm font-medium text-white">{order.packageType}</p>
                  {order.note && <p className="mt-1 text-xs text-white/50">{order.note}</p>}
                </div>
                <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Payment</p>
                  <p className="mt-1 text-sm font-medium text-white">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">ETA</p>
                  <p className="mt-1 text-sm font-medium text-white">{order.eta || '\u2014'}</p>
                </div>
                <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Distance</p>
                  <p className="mt-1 text-sm font-medium text-white">{order.distance || '\u2014'}</p>
                </div>
              </div>
            </div>
          </article>

          {/* Progress Steps */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-5">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-orange-400/70">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Progress</p>
            </div>
            <ol className="space-y-4">
              {flowSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.55rem] font-bold ${
                      isCompleted
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                        : 'border-white/10 bg-white/5 text-white/30'
                    }`}>
                      {isCompleted ? '\u2713' : idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${
                        isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-white/40'
                      }`}>{step.label}</p>
                      {isCurrent && currentStep && currentStep.needsPhotos && (
                        <p className="mt-0.5 text-xs text-orange-300/60">Photo upload required</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>
        </div>

        {/* RIGHT COLUMN - Locations & Actions */}
        <div className="flex flex-col gap-6">

          {/* Pickup / Dropoff Locations */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-orange-400/70">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Locations</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Pickup</p>
                <p className="mt-1 text-sm font-medium text-white">{order.pickup}</p>
                <p className="mt-2 text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/40 italic">Map view — Coming Soon</p>
              </div>
              <div className="rounded-md border border-orange-900/25 bg-orange-950/15 p-4">
                <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Drop-off</p>
                <p className="mt-1 text-sm font-medium text-white">{order.destination}</p>
                <p className="mt-2 text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/40 italic">Map view — Coming Soon</p>
              </div>
            </div>
          </article>

          {/* Current Action */}
          <article className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2.5 border-b border-orange-900/20 pb-4 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-orange-900/30 bg-orange-950/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-orange-400/70">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[0.58rem] uppercase tracking-[0.4em] text-orange-400/60">Action</p>
            </div>

            {order.status === 'completed' ? (
              <div className="flex items-center gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Order has been delivered.</span>
              </div>
            ) : null}

            {/* In Transit → Arrived at Pickup (simple click) */}
            {order.status === 'in_transit' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleSimpleAction('arrived_at_pickup')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/20 active:scale-[0.98]"
              >
                {updating ? 'Updating...' : 'Mark as Arrived at Pickup'}
              </button>
            )}

            {/* Arrived at Pickup → upload photos → Picked Up */}
            {order.status === 'arrived_at_pickup' && nextStep?.key === 'picked_up' && (
              <div className="space-y-4">
                <p className="text-xs text-orange-100/60 mb-3">
                  Upload <span className="text-white font-semibold">2-3 photos</span> of the pickup to continue.
                </p>
                <div className="border border-dashed border-orange-900/30 rounded-md p-4">
                  <p className="text-xs text-orange-100/50 mb-3">Pickup Photos ({pickupPhotos.length}/3)</p>
                  {pickupPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pickupPhotos.map((url, i) => (
                        <div key={i} className="relative h-14 w-14 rounded border border-orange-900/30 bg-orange-950/30 overflow-hidden">
                          <img src={url} alt={`Pickup ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {pickupPhotos.length < 3 ? (
                    <button
                      type="button"
                      onClick={handleUploadPickupPhotos}
                      className="border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20"
                    >
                      {pickupPhotos.length === 0 ? 'Upload Photos' : `Upload ${3 - pickupPhotos.length} More`}
                    </button>
                  ) : (
                    <p className="text-xs text-emerald-400">All photos uploaded</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={updating || pickupPhotos.length < 2}
                  onClick={() => handlePhotosThenAction('picked_up', pickupPhotos, 'pickupPhotos')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-5 py-3 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Confirm Picked Up'}
                </button>
              </div>
            )}

            {/* Picked Up → Arrived at Destination (simple click) */}
            {order.status === 'picked_up' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleSimpleAction('arrived_at_destination')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
              >
                {updating ? 'Updating...' : 'Mark as Arrived'}
              </button>
            )}

            {/* Arrived at Destination → upload photo → Delivered */}
            {order.status === 'arrived_at_destination' && (
              <div className="space-y-4">
                <p className="text-xs text-orange-100/60 mb-3">
                  Upload a <span className="text-white font-semibold">delivery photo</span> (proof of delivery) to complete.
                </p>
                {isCodOrder && (
                  <div className="border border-emerald-900/30 bg-emerald-950/15 rounded-md p-4">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-emerald-400/70 mb-2">Cash on Delivery</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/70">Amount collected:</span>
                      <div className="relative flex-1 max-w-[160px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/50">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={codAmount || ''}
                          onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                          className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500/60"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="border border-dashed border-orange-900/30 rounded-md p-4">
                  <p className="text-xs text-orange-100/50 mb-3">Delivery Photo</p>
                  {deliveryPhoto ? (
                    <div className="mb-3">
                      <div className="relative h-20 w-20 rounded border border-orange-900/30 bg-orange-950/30 overflow-hidden">
                        <img src={deliveryPhoto} alt="Delivery" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ) : null}
                  {!deliveryPhoto && (
                    <button
                      type="button"
                      onClick={handleUploadDeliveryPhoto}
                      className="border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20"
                    >
                      Upload Photo
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  disabled={updating || !deliveryPhoto}
                  onClick={async () => {
                    if (!order) return;
                    if (isCodOrder && codAmount > 0) {
                      await updateOrderCodAmount(order.id, codAmount, userEmail);
                    }
                    await handlePhotosThenAction('completed', [deliveryPhoto], 'deliveryPhoto');
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Mark as Delivered'}
                </button>
              </div>
            )}

            {/* Fallback */}
            {!['completed', 'in_transit', 'arrived_at_pickup', 'picked_up', 'arrived_at_destination'].includes(order.status) ? (
              <p className="text-xs text-white/40">No actions available for current status.</p>
            ) : null}

            {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
          </article>
        </div>
      </section>
    </div>
  );
}
