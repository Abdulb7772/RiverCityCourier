"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchCustomerNotifications, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';

type CustomerNavbarProps = {
  userName?: string | null;
  userEmail?: string | null;
  onMenuClick?: () => void;
  onLogout?: () => void;
};

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M12 22a2.25 2.25 0 0 0 2.1-1.45H9.9A2.25 2.25 0 0 0 12 22ZM19 17.5H5l1.2-1.5V11a5.8 5.8 0 0 1 4.3-5.6V4.5a1.5 1.5 0 1 1 3 0v.9A5.8 5.8 0 0 1 17 11v5l1 1.5z" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="m5 7 5 5 5-5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CustomerNavbar({ userName, userEmail, onMenuClick = () => {}, onLogout = () => {} }: CustomerNavbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) return;
    fetchCustomerNotifications(userEmail)
      .then((data) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); })
      .catch(() => {});
  }, [userEmail]);

  const handleMarkAllRead = async () => {
    if (!userEmail) return;
    try {
      await markAllNotificationsRead('customer', userEmail);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const avatarLabel = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'RC';

  const displayName = userName ?? 'Customer';

  return (
    <header className="sticky top-0 h-18 content-center z-40 border-b border-orange-900/40 bg-linear-to-r from-[#1a0800] via-[#2d0f00] to-[#1a0800] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between w-full px-6 sm:px-8 lg:px-10 py-3">

        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-orange-700/40 bg-orange-950/60 text-orange-200 transition hover:border-orange-500/60 hover:bg-orange-900/60"
            aria-label="Open sidebar"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-400/80">RiverCity Courier</p>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Customer Dashboard</h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsNotificationsOpen((c) => !c); setIsProfileOpen(false); }}
              className="relative inline-flex h-10 w-10 items-center justify-center border border-orange-700/40 bg-orange-950/60 text-orange-200 transition hover:border-orange-500/60 hover:bg-orange-900/60"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-80 border border-orange-900/50 bg-[#120500] shadow-2xl shadow-black/60"
                >
                  <div className="border-b border-orange-900/40 px-5 py-3">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <p className="mt-0.5 text-xs text-orange-400/70">Latest updates</p>
                  </div>

                  <div className="divide-y divide-orange-900/20">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-orange-400/60">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map((item) => (
                        <div key={item.id} className={`px-5 py-3 text-sm transition hover:bg-orange-950/60 ${item.read ? 'text-orange-100/50' : 'text-white'}`}>
                          <p className="font-medium">{item.title}</p>
                          <p className="mt-0.5 text-xs text-orange-400/60 line-clamp-2">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-orange-900/40 px-5 py-2">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                      className="text-xs text-orange-400 hover:text-orange-300 transition disabled:opacity-40"
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsProfileOpen((c) => !c); setIsNotificationsOpen(false); }}
              className="flex items-center gap-3 border border-orange-700/40 bg-orange-950/60 px-3 py-2 text-left transition hover:border-orange-500/60 hover:bg-orange-900/60"
            >
              <span className="flex h-8 w-8 items-center justify-center bg-linear-to-br from-orange-500 to-amber-400 text-xs font-bold text-black">
                {avatarLabel}
              </span>
              <span className="hidden sm:flex sm:flex-col">
                <span className="text-sm font-medium text-white">{displayName}</span>
                <span className="max-w-48 truncate text-xs text-orange-400/70">{userEmail ?? 'customer@rivercitycourier.com'}</span>
              </span>
              <span className="text-orange-400/70">
                <ChevronIcon />
              </span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-60 border border-orange-900/50 bg-[#120500] shadow-2xl shadow-black/60"
                >
                  <div className="border-b border-orange-900/40 px-5 py-3">
                    <p className="text-sm font-semibold text-white">{displayName}</p>
                    <p className="mt-0.5 text-xs text-orange-400/70">Customer account</p>
                  </div>

                  <div className="divide-y divide-orange-900/20">
                    <button type="button" onClick={() => { setIsProfileOpen(false); router.push('/customer/profile'); }} className="flex w-full items-center px-5 py-3 text-left text-sm text-orange-100/80 transition hover:bg-orange-950/60 hover:text-white">
                      Profile
                    </button>
                    <button type="button" onClick={() => { setIsProfileOpen(false); router.push('/customer/orders/history'); }} className="flex w-full items-center px-5 py-3 text-left text-sm text-orange-100/80 transition hover:bg-orange-950/60 hover:text-white">
                      Delivery History
                    </button>
                    <button type="button" onClick={() => { setIsProfileOpen(false); router.push('/customer/settings'); }} className="flex w-full items-center px-5 py-3 text-left text-sm text-orange-100/80 transition hover:bg-orange-950/60 hover:text-white">
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-orange-900/40">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center px-5 py-3 text-left text-sm text-rose-400 transition hover:bg-rose-950/30 hover:text-rose-300"
                    >
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}

export default CustomerNavbar;