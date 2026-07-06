'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import { fetchProfile, updateProfile, type CustomerProfile } from '@/lib/customer-profile';

type CustomerProfileScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

function UserIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SaveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CustomerProfileScreen({ userEmail, userName }: CustomerProfileScreenProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Profile');
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) return;
    fetchProfile(userEmail)
      .then((data) => {
        setProfile(data);
        setForm({ fullName: data.fullName, phone: data.phone });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

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

  const handleSave = async () => {
    if (!profile) return;
    if (!form.fullName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      setProfile(updated);
      setForm({ fullName: updated.fullName, phone: updated.phone });
      setEditing(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({ fullName: profile.fullName, phone: profile.phone });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

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

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Customer Account
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                Profile Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Your account information and preferences. Changes are saved to the server immediately.
              </p>
            </div>

            {!editing && profile && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/20"
              >
                <EditIcon className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="border border-rose-900/40 bg-rose-950/30 px-6 py-12 text-center text-sm text-rose-300">
            Failed to load profile.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

            {/* Main profile card */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center bg-linear-to-br from-amber-500 to-orange-400 text-xl font-bold text-black">
                  {profile.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                  <p className="mt-1 text-sm text-orange-300/70">{profile.role}</p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4 border-b border-orange-900/20 pb-5">
                  <UserIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500/60" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/60">Full Name</p>
                    {editing ? (
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="mt-1 w-full max-w-md border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-white">{profile.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 border-b border-orange-900/20 pb-5">
                  <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500/60" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/60">Email</p>
                    <p className="mt-1 text-sm text-white">{profile.email}</p>
                    <p className="mt-0.5 text-xs text-orange-400/50">Email cannot be changed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-b border-orange-900/20 pb-5">
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500/60" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/60">Phone</p>
                    {editing ? (
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+92 300 000 0000"
                        className="mt-1 w-full max-w-md border border-orange-900/40 bg-orange-950/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500/50"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-white">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 border-b border-orange-900/20 pb-5">
                  <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500/60" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/60">Role</p>
                    <p className="mt-1 text-sm font-semibold text-amber-400 capitalize">{profile.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500/60" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/60">Member Since</p>
                    <p className="mt-1 text-sm text-white">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {editing && (
                <div className="mt-8 flex items-center gap-3 border-t border-orange-900/20 pt-6">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SaveIcon className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 border border-orange-800/40 px-5 py-2.5 text-sm text-orange-300/70 transition hover:border-orange-500/50 hover:text-orange-200"
                  >
                    <XIcon className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Side panel */}
            <div className="flex flex-col gap-5">
              <div className="border border-orange-900/40 bg-slate-950/60 p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Account Status</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Security</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <span className="text-sm text-orange-100/70">Two-Factor Auth</span>
                    <span className="text-xs text-orange-400/50">Coming soon</span>
                  </div>
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <span className="text-sm text-orange-100/70">Last Login</span>
                    <span className="text-xs text-orange-400/50">Today</span>
                  </div>
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-3">
                    <span className="text-sm text-orange-100/70">Sessions</span>
                    <span className="text-xs text-orange-400/50">1 active</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
