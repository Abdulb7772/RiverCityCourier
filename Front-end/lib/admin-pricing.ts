export type VehicleCharge = {
  type: string;
  baseRate: number;
  perKmRate: number;
  active: boolean;
};

export type Discount = {
  name: string;
  type: 'percentage' | 'flat';
  value: number;
  minDistance: number;
  minOrderValue: number;
  active: boolean;
};

export type TimeRange = {
  day: string;
  start: string;
  end: string;
};

export type PeakHours = {
  enabled: boolean;
  multiplier: number;
  timeRanges: TimeRange[];
};

export type PricingConfig = {
  id: string;
  perKmPrice: number;
  vehicleCharges: VehicleCharge[];
  discounts: Discount[];
  peakHours: PeakHours;
  updatedAt: string;
};

export async function fetchPricing(): Promise<PricingConfig> {
  const response = await fetch('/api/admin/pricing', { cache: 'no-store' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch pricing configuration.');
  }

  return response.json();
}

export async function updatePricing(
  data: Partial<Pick<PricingConfig, 'perKmPrice' | 'vehicleCharges' | 'discounts' | 'peakHours'>>,
): Promise<PricingConfig> {
  const response = await fetch('/api/admin/pricing', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pricing configuration.');
  }

  return response.json();
}
