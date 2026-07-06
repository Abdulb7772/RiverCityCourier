'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { fetchPricing, updatePricing as updatePricingApi, type PricingConfig, type VehicleCharge, type Discount, type TimeRange } from '@/lib/admin-pricing';



type PricingScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

function DollarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 6v12M8.5 10c0-1.5 1.5-2.5 3.5-2.5s3.5 1 3.5 2.5-1.5 2.5-3.5 2.5-3.5 1-3.5 2.5 1.5 2.5 3.5 2.5 3.5-1 3.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

function PercentIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.7" />
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

function SaveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M17 21v-8H7v8M7 3v5h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3l4 4-4 4M17 13l-4 4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 7h16M10 11v5M14 11v5M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}



export function PricingScreen({ userEmail, userName }: PricingScreenProps) {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Pricing');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPricing()
      .then(setPricing)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      if (item === 'Dashboard') { router.push('/admin'); return; }
      if (item === 'Orders') { router.push('/admin/orders'); return; }
      if (item === 'Drivers') { router.push('/admin/drivers'); return; }
      if (item === 'Customers') { router.push('/admin/customers'); return; }
      if (item === 'Pricing') { router.push('/admin/pricing'); return; }
      if (item === 'Support') { router.push('/admin/support'); return; }
      router.push('/admin');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const handleSave = async () => {
    if (!pricing) return;
    setSaving(true);
    try {
      const updated = await updatePricingApi({
        perKmPrice: pricing.perKmPrice,
        vehicleCharges: pricing.vehicleCharges,
        discounts: pricing.discounts,
        peakHours: pricing.peakHours,
      });
      setPricing(updated);
      toast.success('Pricing configuration saved successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save pricing.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateVehicleCharge = (index: number, field: keyof VehicleCharge, value: string | number | boolean) => {
    if (!pricing) return;
    const charges = pricing.vehicleCharges.map((vc, i) =>
      i === index ? { ...vc, [field]: value } : vc,
    );
    setPricing({ ...pricing, vehicleCharges: charges });
  };

  const removeVehicleCharge = (index: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, vehicleCharges: pricing.vehicleCharges.filter((_, i) => i !== index) });
  };

  const addVehicleCharge = () => {
    if (!pricing) return;
    const newVehicle: VehicleCharge = {
      type: '',
      baseRate: 0,
      perKmRate: 0,
      active: true,
    };
    setPricing({ ...pricing, vehicleCharges: [...pricing.vehicleCharges, newVehicle] });
  };

  const updateDiscount = (index: number, field: keyof Discount, value: string | number | boolean) => {
    if (!pricing) return;
    const discounts = pricing.discounts.map((d, i) =>
      i === index ? { ...d, [field]: value } : d,
    );
    setPricing({ ...pricing, discounts });
  };

  const removeDiscount = (index: number) => {
    if (!pricing) return;
    setPricing({ ...pricing, discounts: pricing.discounts.filter((_, i) => i !== index) });
  };

  const addDiscount = () => {
    if (!pricing) return;
    const newDiscount: Discount = {
      name: '',
      type: 'percentage',
      value: 0,
      minDistance: 0,
      minOrderValue: 0,
      active: true,
    };
    setPricing({ ...pricing, discounts: [...pricing.discounts, newDiscount] });
  };

  const updateTimeRange = (index: number, field: keyof TimeRange, value: string) => {
    if (!pricing) return;
    const ranges = pricing.peakHours.timeRanges.map((tr, i) =>
      i === index ? { ...tr, [field]: value } : tr,
    );
    setPricing({ ...pricing, peakHours: { ...pricing.peakHours, timeRanges: ranges } });
  };

  const removeTimeRange = (index: number) => {
    if (!pricing) return;
    setPricing({
      ...pricing,
      peakHours: {
        ...pricing.peakHours,
        timeRanges: pricing.peakHours.timeRanges.filter((_, i) => i !== index),
      },
    });
  };

  const addTimeRange = () => {
    if (!pricing) return;
    const newRange: TimeRange = { day: 'weekday', start: '08:00', end: '10:00' };
    setPricing({
      ...pricing,
      peakHours: {
        ...pricing.peakHours,
        timeRanges: [...pricing.peakHours.timeRanges, newRange],
      },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Configure delivery fees, vehicle rates, discounts, and peak hour multipliers."
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

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Admin Pricing
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                Pricing Configuration
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Set base rates per kilometer, vehicle-specific charges, discount rules, and peak-hour multipliers. Changes take effect immediately for new orders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-orange-300">
                <span className={`h-1.5 w-1.5 rounded-full ${pricing ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
                {pricing ? 'Live' : 'Offline'}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !pricing}
                className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SaveIcon className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {pricing && (
            <div className="mt-4 text-xs text-orange-300/50">
              Last updated: {new Date(pricing.updatedAt).toLocaleString()}
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="border border-orange-900/40 bg-slate-950/60 px-8 py-6 text-sm text-orange-100/60">
              Loading pricing configuration...
            </div>
          </div>
        ) : !pricing ? (
          <div className="flex items-center justify-center py-20">
            <div className="border border-rose-900/40 bg-rose-950/30 px-8 py-6 text-sm text-rose-300">
              Failed to load pricing data.
            </div>
          </div>
        ) : (
          <>
            {/* Per KM Price */}
            <section className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <DollarIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-white">Base Per-Kilometer Rate</h2>
                  <p className="mt-1 text-sm text-orange-100/60">
                    Standard rate charged for every kilometer of delivery distance.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex max-w-xs items-center gap-4">
                <label className="text-sm text-orange-200/70">$ per km</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.perKmPrice}
                  onChange={(e) => setPricing({ ...pricing, perKmPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                />
              </div>
            </section>

            {/* Vehicle Type Charges */}
            <section className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <TruckIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-white">Vehicle Type Charges</h2>
                  <p className="mt-1 text-sm text-orange-100/60">
                    Base and per-km rates specific to each vehicle type.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pricing.vehicleCharges.map((vc, index) => (
                  <div key={index} className="border border-orange-900/40 bg-orange-950/20 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={vc.type}
                        onChange={(e) => updateVehicleCharge(index, 'type', e.target.value)}
                        placeholder="Vehicle type"
                        className="flex-1 border border-orange-900/40 bg-orange-950/40 px-2 py-1.5 text-sm font-semibold uppercase tracking-wider text-white outline-none transition focus:border-orange-500/50"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-orange-300/60">
                          Active
                          <input
                            type="checkbox"
                            checked={vc.active}
                            onChange={(e) => updateVehicleCharge(index, 'active', e.target.checked)}
                            className="h-4 w-4 accent-orange-500"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVehicleCharge(index)}
                          className="border border-rose-800/40 bg-rose-950/30 p-1.5 text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-900/30"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs text-orange-400/60">Base Rate ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={vc.baseRate}
                          onChange={(e) => updateVehicleCharge(index, 'baseRate', parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-orange-400/60">Per KM Rate ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={vc.perKmRate}
                          onChange={(e) => updateVehicleCharge(index, 'perKmRate', parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addVehicleCharge}
                className="mt-4 flex items-center gap-2 border border-dashed border-orange-700/40 px-5 py-3 text-sm text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Vehicle Type
              </button>
            </section>

            {/* Discounts */}
            <section className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <PercentIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-white">Discount Rules</h2>
                  <p className="mt-1 text-sm text-orange-100/60">
                    Percentage or flat discounts applied based on distance or order value thresholds.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {pricing.discounts.map((discount, index) => (
                  <div key={index} className="border border-orange-900/40 bg-orange-950/20 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex flex-1 flex-wrap gap-4">
                        <div className="min-w-35 flex-1">
                          <label className="text-xs text-orange-400/60">Name</label>
                          <input
                            type="text"
                            value={discount.name}
                            onChange={(e) => updateDiscount(index, 'name', e.target.value)}
                            className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                          />
                        </div>
                        <div className="min-w-25">
                          <label className="text-xs text-orange-400/60">Type</label>
                          <select
                            value={discount.type}
                            onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                            className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="flat">Flat ($)</option>
                          </select>
                        </div>
                        <div className="min-w-[80px]">
                          <label className="text-xs text-orange-400/60">Value</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={discount.value}
                            onChange={(e) => updateDiscount(index, 'value', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                          />
                        </div>
                        <div className="min-w-[80px]">
                          <label className="text-xs text-orange-400/60">Min KM</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={discount.minDistance}
                            onChange={(e) => updateDiscount(index, 'minDistance', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                          />
                        </div>
                        <div className="min-w-[80px]">
                          <label className="text-xs text-orange-400/60">Min $</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={discount.minOrderValue}
                            onChange={(e) => updateDiscount(index, 'minOrderValue', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 text-xs text-orange-300/60">
                          Active
                          <input
                            type="checkbox"
                            checked={discount.active}
                            onChange={(e) => updateDiscount(index, 'active', e.target.checked)}
                            className="h-4 w-4 accent-orange-500"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDiscount(index)}
                          className="border border-rose-800/40 bg-rose-950/30 p-2 text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-900/30"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addDiscount}
                className="mt-4 flex items-center gap-2 border border-dashed border-orange-700/40 px-5 py-3 text-sm text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200"
              >
                <PlusIcon className="h-4 w-4" />
                Add Discount Rule
              </button>
            </section>

            {/* Peak Hours Rate */}
            <section className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-white">Peak Hours Rate</h2>
                  <p className="mt-1 text-sm text-orange-100/60">
                    Apply a multiplier to delivery costs during high-demand time windows.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-orange-200/70">
                  <input
                    type="checkbox"
                    checked={pricing.peakHours.enabled}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        peakHours: { ...pricing.peakHours, enabled: e.target.checked },
                      })
                    }
                    className="h-4 w-4 accent-orange-500"
                  />
                  Enable Peak Hour Pricing
                </label>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-orange-200/70">Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={pricing.peakHours.multiplier}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        peakHours: { ...pricing.peakHours, multiplier: parseFloat(e.target.value) || 1 },
                      })
                    }
                    disabled={!pricing.peakHours.enabled}
                    className="w-24 border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {pricing.peakHours.timeRanges.map((range, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-3 border border-orange-900/30 bg-orange-950/20 p-4">
                    <div>
                      <label className="text-xs text-orange-400/60">Day</label>
                      <select
                        value={range.day}
                        onChange={(e) => updateTimeRange(index, 'day', e.target.value)}
                        disabled={!pricing.peakHours.enabled}
                        className="mt-1 border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <option value="weekday">Weekday</option>
                        <option value="weekend">Weekend</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-orange-400/60">Start</label>
                      <input
                        type="time"
                        value={range.start}
                        onChange={(e) => updateTimeRange(index, 'start', e.target.value)}
                        disabled={!pricing.peakHours.enabled}
                        className="mt-1 border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-orange-400/60">End</label>
                      <input
                        type="time"
                        value={range.end}
                        onChange={(e) => updateTimeRange(index, 'end', e.target.value)}
                        disabled={!pricing.peakHours.enabled}
                        className="mt-1 border border-orange-900/40 bg-orange-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeRange(index)}
                      disabled={!pricing.peakHours.enabled}
                      className="border border-rose-800/40 bg-rose-950/30 p-2 text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addTimeRange}
                disabled={!pricing.peakHours.enabled}
                className="mt-4 flex items-center gap-2 border border-dashed border-orange-700/40 px-5 py-3 text-sm text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PlusIcon className="h-4 w-4" />
                Add Time Range
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
