'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DriverNavbar } from './DriverNavbar';
import { DriverSidebar, driverSidebarItems } from './DriverSidebar';
import { fetchDriverProfile, type DriverProfile } from '@/lib/driver-profile';

type Props = {
  userEmail: string;
  userName?: string | null;
};

export function DriverProfileClient({ userEmail, userName }: Props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile(userEmail)
      .then(setProfile)
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <DriverNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="View your driver account details."
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
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center bg-gradient-to-br from-emerald-500 to-lime-400 text-lg font-bold text-black">
              {userName ? userName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : 'DR'}
            </span>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/70">Driver Profile</p>
              <h1 className="mt-1 text-2xl font-bold text-white">{profile?.fullName || userName || 'Driver'}</h1>
              <p className="mt-0.5 text-sm text-orange-300/60">{profile?.email || userEmail}</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/40 border-t-orange-400" />
          </div>
        ) : !profile ? (
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-6 py-12 text-center text-sm text-rose-300">
            Failed to load profile.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-orange-900/40 bg-slate-950/60 p-6">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Account Info</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-orange-400/60">Full Name</p>
                  <p className="mt-0.5 text-sm font-medium text-white">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-400/60">Email</p>
                  <p className="mt-0.5 text-sm text-white">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-400/60">Phone</p>
                  <p className="mt-0.5 text-sm text-white">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-400/60">Role</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-white">{profile.role}</p>
                </div>
              </div>
            </div>

            <div className="border border-orange-900/40 bg-slate-950/60 p-6">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-orange-400/50">Verification & Status</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-orange-400/60">Account Status</p>
                  <span className={`mt-1 inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${
                    profile.status === 'active' ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300' : 'border-yellow-600/40 bg-yellow-950/30 text-yellow-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${profile.status === 'active' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                    {profile.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-orange-400/60">Verified</p>
                  <span className={`mt-1 inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${
                    profile.verified ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300' : 'border-yellow-600/40 bg-yellow-950/30 text-yellow-300'
                  }`}>
                    {profile.verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-orange-400/60">Member Since</p>
                  <p className="mt-0.5 text-sm text-white">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
