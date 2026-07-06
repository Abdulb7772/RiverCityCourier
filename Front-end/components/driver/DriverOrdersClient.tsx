'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { DriverNavbar } from './DriverNavbar';
import { DriverSidebar, driverSidebarItems } from './DriverSidebar';
import { DriverAssignedOrders } from './DriverAssignedOrders';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

export function DriverOrdersClient({ userEmail, userName }: Props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        summaryText="View and manage all orders assigned to you."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <DriverSidebar
        isOpen={isSidebarOpen}
        activeSection="Assigned Orders"
        items={driverSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        <DriverAssignedOrders userEmail={userEmail} />
      </main>
    </div>
  );
}
