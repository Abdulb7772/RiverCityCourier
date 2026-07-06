export type ReportData = {
  ordersByStatus: { name: string; value: number }[];
  totalOrders: number;
  totalDrivers: number;
  totalReviews: number;
  averageRating: string;
};

export async function fetchReportData(): Promise<ReportData> {
  const response = await fetch('/api/admin/reports', { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch report data.');
  }
  return response.json();
}
