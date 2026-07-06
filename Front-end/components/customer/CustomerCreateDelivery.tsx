'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import { createCustomerOrder } from '@/lib/customer-orders';
import { fetchPricing, type PricingConfig } from '@/lib/admin-pricing';
import { fetchLocations, type SavedLocation } from '@/lib/customer-locations';
import { createCheckoutSession } from '@/lib/stripe';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

const vehicleTypes = ['Bike', 'Car', 'Van', 'Truck'];
const DEFAULT_DISTANCE_KM = 10;

type PriceBreakdown = {
  baseRate: number;
  perKmRate: number;
  distanceKm: number;
  distanceCharge: number;
  subtotal: number;
  peakMultiplier: number;
  total: number;
};

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

function calculatePrice(pricing: PricingConfig | null, vehicleType: string, distanceKm: number): PriceBreakdown {
  const charges = Array.isArray(pricing?.vehicleCharges) ? pricing.vehicleCharges : [];
  const vehicle = charges.find(
    (v) => v.type.toLowerCase() === vehicleType.toLowerCase() && v.active,
  ) ?? charges.find((v) => v.active) ?? { type: vehicleType, baseRate: 0, perKmRate: 0 };

  const baseRate = vehicle.baseRate;
  const perKmRate = vehicle.perKmRate;
  const distanceCharge = perKmRate * distanceKm;
  const subtotal = baseRate + distanceCharge;

  let peakMultiplier = 1;
  if (pricing?.peakHours?.enabled && Array.isArray(pricing.peakHours.timeRanges)) {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const inRange = pricing.peakHours.timeRanges.some((range) => {
      if (range.day.toLowerCase() !== currentDay) return false;
      return currentTime >= range.start && currentTime < range.end;
    });

    if (inRange) peakMultiplier = pricing.peakHours.multiplier;
  }

  const total = subtotal * peakMultiplier;

  return { baseRate, perKmRate, distanceKm, distanceCharge, subtotal, peakMultiplier, total };
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function toLocalTimestamp(date: string, time: string): number | null {
  if (!date || !time) return null;
  const timestamp = new Date(`${date}T${time}:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function CustomerCreateDelivery({ userEmail, userName }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const router = useRouter();

  const [pickupName, setPickupName] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [pickupItems, setPickupItems] = useState('');
  const [pickupQuantity, setPickupQuantity] = useState('');
  const [pickupVehicleType, setPickupVehicleType] = useState('Bike');
  const [pickupLocation, setPickupLocation] = useState('');

  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryItems, setDeliveryItems] = useState('');
  const [deliveryQuantity, setDeliveryQuantity] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [priority, setPriority] = useState('medium');
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  useEffect(() => {
    fetchPricing().then(setPricing).catch(() => {});
    if (userEmail) {
      fetchLocations(userEmail).then(setSavedLocations).catch(() => {});
    }
  }, [userEmail]);

  const priceBreakdown: PriceBreakdown | null = pricing
    ? calculatePrice(pricing, pickupVehicleType, DEFAULT_DISTANCE_KM)
    : null;

  const handleSidebarSelect = (item: string) => {
    setIsSidebarOpen(false);
    const paths: Record<string, string> = {
      Dashboard: '/dashboard', 'Create Delivery': '/customer/create-delivery',
      'Active Deliveries': '/customer/orders', 'Delivery History': '/customer/orders/history', 'Saved Addresses': '/customer/saved-locations',
      Profile: '/customer/profile', Support: '/customer/support',
    };
    router.push(paths[item] || '/dashboard');
  };

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const handleShowSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupName || !pickupLocation || !deliveryName || !deliveryLocation) {
      setError('Pickup name, pickup location, delivery name, and delivery location are required.');
      return;
    }

    if (!pickupItems.trim() || !deliveryItems.trim()) {
      setError('Please provide item details for both pickup and delivery.');
      return;
    }

    if (normalizeText(pickupItems) !== normalizeText(deliveryItems)) {
      setError('Pickup and delivery item details must match.');
      return;
    }

    if (!pickupQuantity.trim() || !deliveryQuantity.trim()) {
      setError('Please provide quantity for both pickup and delivery.');
      return;
    }

    if (normalizeText(pickupQuantity) !== normalizeText(deliveryQuantity)) {
      setError('Pickup and delivery quantity must match.');
      return;
    }

    if ((pickupDate && !deliveryDate) || (!pickupDate && deliveryDate)) {
      setError('Please provide both pickup and delivery dates.');
      return;
    }

    if ((pickupTime && !deliveryTime) || (!pickupTime && deliveryTime)) {
      setError('Please provide both pickup and delivery times.');
      return;
    }

    if (pickupDate && deliveryDate) {
      const pickupDateOnly = new Date(`${pickupDate}T00:00:00`).getTime();
      const deliveryDateOnly = new Date(`${deliveryDate}T00:00:00`).getTime();

      if (deliveryDateOnly < pickupDateOnly) {
        setError('Delivery date cannot be earlier than pickup date.');
        return;
      }
    }

    const pickupTimestamp = toLocalTimestamp(pickupDate, pickupTime);
    const deliveryTimestamp = toLocalTimestamp(deliveryDate, deliveryTime);
    if (pickupTimestamp !== null && deliveryTimestamp !== null && deliveryTimestamp < pickupTimestamp) {
      setError('Delivery date/time cannot be earlier than pickup date/time.');
      return;
    }

    setError('');
    setShowSummary(true);
  };

  const handleConfirm = async () => {
    if (!priceBreakdown) return;
    setSubmitting(true);
    setError('');

    const orderData = {
      customer: pickupName,
      customerEmail: userEmail || '',
      pickup: pickupLocation,
      destination: deliveryLocation,
      contact: pickupContact,
      packageType: pickupItems,
      pickupName,
      pickupContact,
      pickupItems,
      pickupQuantity,
      pickupVehicleType,
      deliveryName,
      deliveryContact,
      deliveryItems,
      deliveryQuantity,
      deliveryVehicleType: pickupVehicleType,
      pickupDate,
      pickupTime,
      deliveryDate,
      deliveryTime,
      priority,
      paymentMethod: paymentMethod === 'cod' ? 'cash' : 'stripe',
      note: `Pickup items: ${pickupItems}, Delivery items: ${deliveryItems}`,
    };

    try {
      if (paymentMethod === 'online') {
        const session = await createCheckoutSession({
          ...orderData,
          total: priceBreakdown.total,
        });
        window.location.href = session.url;
      } else {
        await createCustomerOrder(orderData);
        setSuccess(true);
        setTimeout(() => router.push('/customer/orders'), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setShowSummary(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <CustomerNavbar
        userName={userName}
        userEmail={userEmail}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        activeItem="Create Delivery"
        onClose={() => setIsSidebarOpen(false)}
        onSelect={handleSidebarSelect}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 pb-20 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Customer Booking</p>
            <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
              {showSummary ? 'Order Summary' : 'Create a New Delivery'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
              {showSummary
                ? 'Review your order details and pricing before confirming.'
                : 'Fill in the pickup and delivery details below to book a new shipment.'}
            </p>
          </div>
        </section>

        {success ? (
          <div className="border border-emerald-500/40 bg-emerald-500/10 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-emerald-200">Order created successfully!</p>
            <p className="mt-2 text-sm text-emerald-100/60">Redirecting to your orders...</p>
          </div>
        ) : showSummary ? (
          <>
            {/* Summary Section */}
            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <MapPinIcon />
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Pickup</p>
                  <h2 className="text-lg font-semibold text-white">Pickup Details</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Name</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupName}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Contact</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupContact || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Items</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupItems || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Quantity</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupQuantity || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Vehicle</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupVehicleType}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Location</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupLocation}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Pickup Date</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupDate || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Pickup Time</p>
                  <p className="mt-1 text-sm font-medium text-white">{pickupTime || '\u2014'}</p>
                </div>
              </div>
            </section>

            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <NavigationIcon />
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Delivery</p>
                  <h2 className="text-lg font-semibold text-white">Delivery Details</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Name</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryName}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Contact</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryContact || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Items</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryItems || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Quantity</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryQuantity || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Location</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryLocation}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Delivery Date</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryDate || '\u2014'}</p>
                </div>
                <div className="border border-orange-900/25 bg-orange-950/15 p-4">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/55">Delivery Time</p>
                  <p className="mt-1 text-sm font-medium text-white">{deliveryTime || '\u2014'}</p>
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Pricing</p>
                  <h2 className="text-lg font-semibold text-white">Price Breakdown</h2>
                </div>
              </div>

              {priceBreakdown ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-orange-900/20 py-2.5">
                    <span className="text-sm text-orange-100/60">Vehicle ({pickupVehicleType})</span>
                    <span className="text-sm font-medium text-white">{formatPrice(priceBreakdown.baseRate)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-orange-900/20 py-2.5">
                    <span className="text-sm text-orange-100/60">Priority</span>
                    <span className={`text-sm font-semibold ${
                      priority === 'high' ? 'text-rose-400' : priority === 'low' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-orange-900/20 py-2.5">
                    <span className="text-sm text-orange-100/60">Distance ({priceBreakdown.distanceKm} km × {formatPrice(priceBreakdown.perKmRate)}/km)</span>
                    <span className="text-sm font-medium text-white">{formatPrice(priceBreakdown.distanceCharge)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-orange-900/20 py-2.5">
                    <span className="text-sm text-orange-100/60">Subtotal</span>
                    <span className="text-sm font-medium text-white">{formatPrice(priceBreakdown.subtotal)}</span>
                  </div>
                  {priceBreakdown.peakMultiplier > 1 && (
                    <div className="flex items-center justify-between border-b border-orange-900/20 py-2.5">
                      <span className="text-sm text-orange-100/60">Peak Hour Multiplier (×{priceBreakdown.peakMultiplier})</span>
                      <span className="text-sm font-medium text-amber-300">Active</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-base font-semibold text-white">Total</span>
                    <span className="text-lg font-bold text-emerald-400">{formatPrice(priceBreakdown.total)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-orange-100/50">Loading pricing...</p>
              )}

              <p className="mt-4 text-xs text-orange-400/50">
                * Distance is estimated at {DEFAULT_DISTANCE_KM} km. Final price may vary based on actual route distance.
              </p>
            </section>

            {/* Payment Method */}
            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Payment</p>
                  <h2 className="text-lg font-semibold text-white">Choose Payment Method</h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`relative flex flex-col gap-3 border p-5 text-left transition-all duration-200 ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                      : 'border-orange-900/30 bg-orange-950/15 hover:border-orange-500/30 hover:bg-orange-950/25'
                  }`}
                >
                  {paymentMethod === 'cod' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">✓</span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center border ${
                      paymentMethod === 'cod' ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' : 'border-orange-900/40 bg-orange-950/60 text-orange-400'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${paymentMethod === 'cod' ? 'text-emerald-200' : 'text-white'}`}>Cash on Delivery</p>
                      <p className="mt-0.5 text-xs text-orange-400/60">Pay when your package arrives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-400/50">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    No upfront payment needed
                  </div>
                </button>

                {/* Pay Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`relative flex flex-col gap-3 border p-5 text-left transition-all duration-200 ${
                    paymentMethod === 'online'
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
                      : 'border-orange-900/30 bg-orange-950/15 hover:border-orange-500/30 hover:bg-orange-950/25'
                  }`}
                >
                  {paymentMethod === 'online' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">✓</span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center border ${
                      paymentMethod === 'online' ? 'border-blue-500/50 bg-blue-500/15 text-blue-300' : 'border-orange-900/40 bg-orange-950/60 text-orange-400'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.7" />
                        <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${paymentMethod === 'online' ? 'text-blue-200' : 'text-white'}`}>Pay Online</p>
                      <p className="mt-0.5 text-xs text-orange-400/60">Secure card payment via Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-400/50">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Secured by Stripe
                  </div>
                </button>
              </div>
            </section>

            {error && (
              <div className="border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pb-8">
              <button
                type="button"
                onClick={handleBack}
                className="border border-orange-900/40 bg-orange-950/30 px-6 py-3 text-sm text-orange-200 transition hover:border-orange-500/40 hover:bg-orange-950/50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting || !priceBreakdown}
                onClick={handleConfirm}
                className={`px-6 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  paymentMethod === 'online'
                    ? 'border border-blue-500/30 bg-blue-500/10 text-blue-200 hover:border-blue-400/50 hover:bg-blue-500/20'
                    : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/50 hover:bg-emerald-500/20'
                }`}
              >
                {submitting
                  ? paymentMethod === 'online' ? 'Redirecting to Stripe...' : 'Booking...'
                  : paymentMethod === 'online'
                    ? `Pay ${priceBreakdown ? formatPrice(priceBreakdown.total) : ''} with Card`
                    : `Confirm & Pay ${priceBreakdown ? formatPrice(priceBreakdown.total) : ''}`}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleShowSummary} className="flex flex-col gap-8">

            {/* Pickup Details */}
            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <MapPinIcon />
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Step 1</p>
                  <h2 className="text-lg font-semibold text-white">Pickup Details</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Name</label>
                  <input
                    type="text"
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                    placeholder="Sender name"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Contact Number</label>
                  <input
                    type="text"
                    value={pickupContact}
                    onChange={(e) => setPickupContact(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Items Details</label>
                  <input
                    type="text"
                    value={pickupItems}
                    onChange={(e) => setPickupItems(e.target.value)}
                    placeholder="e.g. Electronics, Documents"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Quantity</label>
                  <input
                    type="text"
                    value={pickupQuantity}
                    onChange={(e) => setPickupQuantity(e.target.value)}
                    placeholder="e.g. 2 boxes, 5 kg"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Vehicle Type</label>
                  <select
                    value={pickupVehicleType}
                    onChange={(e) => setPickupVehicleType(e.target.value)}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  >
                    {vehicleTypes.map((v) => (
                      <option key={v} value={v} className="bg-[#1a0800]">{v}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  >
                    <option value="low" className="bg-[#1a0800]">Low</option>
                    <option value="medium" className="bg-[#1a0800]">Medium</option>
                    <option value="high" className="bg-[#1a0800]">High</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Location</label>
                  {savedLocations.length > 0 && (
                    <select
                      onChange={(e) => {
                        const selected = savedLocations.find((l) => l.id === e.target.value);
                        if (selected) setPickupLocation(selected.address);
                      }}
                      defaultValue=""
                      className="mb-2 border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                    >
                      <option value="" className="bg-[#1a0800]">Select saved location...</option>
                      {savedLocations.map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#1a0800]">{l.locationName} — {l.address}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Or manually enter pickup address"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 scheme-dark"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Pickup Time</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 scheme-dark"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Details */}
            <section className="w-full border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-orange-900/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-300">
                  <NavigationIcon />
                </span>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Step 2</p>
                  <h2 className="text-lg font-semibold text-white">Delivery Details</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Name</label>
                  <input
                    type="text"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    placeholder="Recipient name"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Contact Number</label>
                  <input
                    type="text"
                    value={deliveryContact}
                    onChange={(e) => setDeliveryContact(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Items Details</label>
                  <input
                    type="text"
                    value={deliveryItems}
                    onChange={(e) => setDeliveryItems(e.target.value)}
                    placeholder="e.g. Clothes, Books"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Quantity</label>
                  <input
                    type="text"
                    value={deliveryQuantity}
                    onChange={(e) => setDeliveryQuantity(e.target.value)}
                    placeholder="e.g. 1 box, 3 kg"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Location</label>
                  {savedLocations.length > 0 && (
                    <select
                      onChange={(e) => {
                        const selected = savedLocations.find((l) => l.id === e.target.value);
                        if (selected) setDeliveryLocation(selected.address);
                      }}
                      defaultValue=""
                      className="mb-2 border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                    >
                      <option value="" className="bg-[#1a0800]">Select saved location...</option>
                      {savedLocations.map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#1a0800]">{l.locationName} — {l.address}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Or manually enter delivery address"
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={pickupDate || undefined}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 scheme-dark"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-orange-400/60">Delivery Time</label>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    min={pickupDate && deliveryDate && pickupDate === deliveryDate ? pickupTime || undefined : undefined}
                    className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 scheme-dark"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pb-8">
              <button
                type="button"
                onClick={() => router.push('/customer/orders')}
                className="border border-orange-900/40 bg-orange-950/30 px-6 py-3 text-sm text-orange-200 transition hover:border-orange-500/40 hover:bg-orange-950/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
              >
                Review Order
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}