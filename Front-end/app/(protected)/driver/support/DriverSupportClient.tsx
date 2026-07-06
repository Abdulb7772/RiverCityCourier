'use client';

import { useState } from 'react';
import { DriverNavbar } from '@/components/driver/DriverNavbar';
import { DriverSidebar, driverSidebarItems } from '@/components/driver/DriverSidebar';
import { SupportScreen } from '@/components/SupportScreen';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

export function DriverSupportClient({ userEmail, userName }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Support');

  const items = [...driverSidebarItems, 'Support'];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <DriverNavbar
        userName={userName}
        userEmail={userEmail}
        summaryText="Support"
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <DriverSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={items}
        onSelect={(item: string) => {
          setActiveSection(item);
          setIsSidebarOpen(false);
        }}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { window.location.href = '/auth/login'; }}
      />

      <SupportScreen role="driver" />
    </div>
  );
}
