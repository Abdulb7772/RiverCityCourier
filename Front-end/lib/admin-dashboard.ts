export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  totalOrders: number;
  totalDrivers: number;
  totalRevenue: number;
};

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard data.');
  }
  return response.json();
}
