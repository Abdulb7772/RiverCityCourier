'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DriverNavbar } from './DriverNavbar';
import { DriverSidebar, driverSidebarItems } from './DriverSidebar';
import { fetchAvailability, updateAvailability } from '@/lib/driver-availability';

type Props = {
  userEmail: string;
  userName?: string | null;
};

const availabilityLevels = [
  { value: 'Offline', label: 'Offline', color: 'text-rose-400', bar: 'bg-rose-500', desc: 'Not accepting new deliveries' },
  { value: 'Busy', label: 'Busy', color: 'text-amber-400', bar: 'bg-amber-500', desc: 'On an active delivery' },
  { value: 'Online', label: 'Online', color: 'text-emerald-400', bar: 'bg-emerald-500', desc: 'Ready to receive assignments' },
];

export function DriverAvailabilityClient({ userEmail, userName }: Props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [availability, setAvailability] = useState('Offline');
  const [sliderValue, setSliderValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailability(userEmail)
      .then((data) => {
        setAvailability(data.availability);
        const idx = availabilityLevels.findIndex((l) => l.value === data.availability);
        setSliderValue(idx >= 0 ? idx : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userEmail]);

  const handleSidebarSelect = useCallback((item: string) => {
    setIsSidebarOpen(false);
    if (item === 'Dashboard') router.push('/driver');
    if (item === 'Assigned Orders') router.push('/driver/orders');
    if (item === 'In Progress') router.push('/driver/orders/in-progress');
    if (item === 'Completed') router.push('/driver/orders/completed');
    if (item === 'Verification') router.push('/driver/verification');
    if (item === 'Support') router.push('/driver/support');
  }, [router]);

  const handleLogout = () => { signOut({ callbackUrl: '/auth/login' }); };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    const newAvail = availabilityLevels[val].value;
    setAvailability(newAvail);
    setSaving(true);
    updateAvailability(userEmail, newAvail).catch(() => {}).finally(() => setSaving(false));
  };

  const currentLevel = availabilityLevels[sliderValue];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <DriverNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Set your availability for new deliveries."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <DriverSidebar
        isOpen={isSidebarOpen}
        activeSection="Dashboard"
        items={driverSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Driver Controls</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Availability</h1>
            <p className="mt-1 text-sm text-orange-300/60">Use the slider to set your current availability status.</p>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/40 border-t-orange-400" /></div>
        ) : (
          <div className="mx-auto w-full max-w-lg">
            <div className="border border-orange-900/40 bg-slate-950/60 p-8 sm:p-10">
              {/* Current status indicator */}
              <div className="mb-10 text-center">
                <div className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold ${
                  currentLevel?.value === 'Online' ? 'border-emerald-600/40 bg-emerald-950/30' :
                  currentLevel?.value === 'Busy' ? 'border-amber-600/40 bg-amber-950/30' :
                  'border-rose-600/40 bg-rose-950/30'
                }`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${currentLevel?.bar || 'bg-rose-500'}`} />
                  <span className={currentLevel?.color || 'text-rose-400'}>{currentLevel?.label || 'Offline'}</span>
                </div>
                <p className="mt-3 text-sm text-orange-300/60">{currentLevel?.desc}</p>
                {saving && <p className="mt-2 text-xs text-orange-400/50 animate-pulse">Updating...</p>}
              </div>

              {/* Slider */}
              <div ref={sliderRef} className="relative">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 appearance-none cursor-pointer rounded-full bg-orange-900/40 outline-none
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-orange-500/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-400 [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:shadow-lg"
                />

                {/* Tick marks */}
                <div className="mt-3 flex justify-between px-0.5">
                  {availabilityLevels.map((level, i) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => {
                        setSliderValue(i);
                        setAvailability(level.value);
                        updateAvailability(userEmail, level.value).catch(() => {});
                      }}
                      className={`text-xs font-medium transition-colors ${i === sliderValue ? level.color : 'text-orange-500/50 hover:text-orange-300'}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {availabilityLevels.map((level) => (
                <div key={level.value} className={`border px-4 py-3 text-center ${
                  level.value === availability
                    ? 'border-orange-500/40 bg-orange-950/30'
                    : 'border-orange-900/30 bg-slate-950/40'
                }`}>
                  <span className={`text-xs font-medium ${level.color}`}>{level.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
