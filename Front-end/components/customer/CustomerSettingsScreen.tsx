'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import { fetchProfile, type CustomerProfile } from '@/lib/customer-profile';
import { updateSettings } from '@/lib/customer-settings';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

function LockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

function MailIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CustomerSettingsScreen({ userEmail, userName }: Props) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [usernameForm, setUsernameForm] = useState({ fullName: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });

  useEffect(() => {
    if (!userEmail) return;
    fetchProfile(userEmail)
      .then((data) => {
        setProfile(data);
        setUsernameForm({ fullName: data.fullName });
        setEmailForm({ email: data.email });
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

  const handleChangePassword = async () => {
    if (!profile) return;
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Both current and new password are required.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await updateSettings({
        id: profile.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!profile) return;
    if (!usernameForm.fullName.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const result = await updateSettings({ id: profile.id, fullName: usernameForm.fullName.trim() });
      setProfile((prev) => prev ? { ...prev, ...result } : null);
      toast.success('Username updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update username.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!profile) return;
    if (!emailForm.email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const result = await updateSettings({ id: profile.id, email: emailForm.email.trim() });
      setProfile((prev) => prev ? { ...prev, ...result } : null);
      toast.success('Email updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email.');
    } finally {
      setSaving(false);
    }
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
                Account Management
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                Customer Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Update your password, change your display name, or modify the email address associated with your account.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            Loading settings...
          </div>
        ) : !profile ? (
          <div className="border border-rose-900/40 bg-rose-950/30 px-6 py-12 text-center text-sm text-rose-300">
            Failed to load profile data.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">

            {/* Change Password */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <LockIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Change Password</h2>
                  <p className="mt-0.5 text-xs text-orange-300/60">Update your login credentials.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-orange-400/60">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <div className="relative">
                  <label className="text-xs text-orange-400/60">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-orange-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-[30px] text-orange-400/60 hover:text-orange-300"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <div>
                  <label className="text-xs text-orange-400/60">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Change Username */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <UserIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Change Username</h2>
                  <p className="mt-0.5 text-xs text-orange-300/60">Update your display name.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-orange-400/60">Current</label>
                  <p className="mt-1 text-sm text-orange-200/70">{profile.fullName}</p>
                </div>
                <div>
                  <label className="text-xs text-orange-400/60">New Username</label>
                  <input
                    type="text"
                    value={usernameForm.fullName}
                    onChange={(e) => setUsernameForm({ fullName: e.target.value })}
                    placeholder="Enter new name"
                    className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChangeUsername}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:border-sky-400/50 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Update Username'}
                </button>
              </div>
            </div>

            {/* Change Email */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <MailIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Change Email</h2>
                  <p className="mt-0.5 text-xs text-orange-300/60">Update your account email.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-orange-400/60">Current</label>
                  <p className="mt-1 text-sm text-orange-200/70">{profile.email}</p>
                </div>
                <div>
                  <label className="text-xs text-orange-400/60">New Email</label>
                  <input
                    type="email"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ email: e.target.value })}
                    placeholder="Enter new email"
                    className="mt-1 w-full border border-orange-900/40 bg-orange-950/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Update Email'}
                </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
