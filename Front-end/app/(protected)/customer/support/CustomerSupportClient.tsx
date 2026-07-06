'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { CustomerSidebar } from '@/components/customer/CustomerSidebar';
import { SupportScreen } from '@/components/SupportScreen';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

export function CustomerSupportClient({ userEmail, userName }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Support');
  const router = useRouter();

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/customer', 'Create Delivery': '/customer/create-delivery',
        'Active Deliveries': '/customer/orders', 'Delivery History': '/customer/orders/history',
        'Saved Addresses': '/customer/saved-locations', Profile: '/customer/profile',
        Support: '/customer/support',
      };
      router.push(paths[item] || '/customer');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_25%),linear-gradient(180deg,#2b1606_0%,#0f172a_50%,#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[48px_48px]" />

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

      <SupportScreen role="customer" />
    </div>
  );
}
