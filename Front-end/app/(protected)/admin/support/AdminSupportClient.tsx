'use client';

import { useState } from 'react';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SupportScreen } from '@/components/SupportScreen';

const adminSidebarItems = [
  'Dashboard', 'Orders', 'Drivers', 'Customers', 'Pricing',
  'AI Assignment', 'Reports', 'Reviews', 'Activity Log', 'Profile', 'Support',
];

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

export function AdminSupportClient({ userEmail, userName }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Support');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <AdminNavbar
        userName={userName}
        userEmail={userEmail}
        summaryText="Support"
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={adminSidebarItems}
        onSelect={(item: string) => setActiveSection(item)}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <SupportScreen role="admin" />
    </div>
  );
}
