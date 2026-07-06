export type ActiveOrder = {
  id: string;
  orderNumber: string;
  pickup: string;
  destination: string;
  status: string;
  customer: string;
  eta: string;
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  pickup: string;
  destination: string;
  createdAt: string;
};

export type DriverDashboardData = {
  completedToday: number;
  activeOrder: ActiveOrder | null;
  totalDeliveries: number;
  recentCompleted: RecentOrder[];
};

export async function fetchDriverDashboard(email: string): Promise<DriverDashboardData> {
  const response = await fetch(`/api/driver/dashboard?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard data.');
  }
  return response.json();
}
