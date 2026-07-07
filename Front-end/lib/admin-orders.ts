export type AdminOrderStatus = 'new' | 'processing' | 'picked_up' | 'completed' | 'rejected';

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  status: AdminOrderStatus;
  priority: string;
  assignedDriver: string;
  paymentMethod: string;
  createdAt: string;
  eta: string;
  packageType: string;
  distance: string;
  contact: string;
  note: string;
  timeline: string[];
  pickupName: string;
  pickupContact: string;
  pickupItems: string;
  pickupQuantity: string;
  pickupVehicleType: string;
  deliveryName: string;
  deliveryContact: string;
  deliveryItems: string;
  deliveryQuantity: string;
  deliveryVehicleType: string;
  pickupPhotos: string[];
  deliveryPhoto: string;
  pickupDate: string;
  deliveryDate: string;
  pickupTime: string;
  deliveryTime: string;
};

export async function fetchOrders(): Promise<AdminOrder[]> {
  const response = await fetch('/api/admin/orders', { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch orders.');
  }
  return response.json();
}

export async function fetchOrder(orderId: string): Promise<AdminOrder> {
  const response = await fetch(`/api/admin/orders/${orderId}`, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order.');
  }
  return response.json();
}

const STORAGE_KEY = 'admin_orders';

export function getStoredOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistOrders(orders: AdminOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

export async function updateOrderStatus(orders: AdminOrder[], orderId: string, status: AdminOrderStatus): Promise<AdminOrder[]> {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order.');
  }

  const updated = await response.json();
  return orders.map((o) => (o.id === orderId ? updated : o));
}

export type Driver = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
  createdAt: string;
};

export async function fetchDrivers(): Promise<Driver[]> {
  const response = await fetch('/api/admin/drivers', { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch drivers.');
  }
  return response.json();
}

export async function assignDriverToOrder(orderId: string, driverEmail: string): Promise<AdminOrder> {
  const response = await fetch(`/api/admin/orders/${orderId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverEmail }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign driver.');
  }

  return response.json();
}
