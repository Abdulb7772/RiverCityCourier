export type DriverOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  status: string;
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
  pickupPhotos: string[];
  deliveryPhoto: string;
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
  pickupDate: string;
  deliveryDate: string;
  pickupTime: string;
  deliveryTime: string;
  codAmount: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const apiBase = '/api/driver/orders';

export async function fetchAssignedOrders(email: string, page = 1, limit = 10): Promise<PaginatedResult<DriverOrder>> {
  const response = await fetch(`${apiBase}?email=${encodeURIComponent(email)}&page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch assigned orders.');
  }

  const result = await response.json();

  if (Array.isArray(result)) {
    return {
      data: result.slice((page - 1) * limit, page * limit),
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
    };
  }

  return result;
}

export async function fetchCompletedOrders(email: string, page = 1, limit = 10): Promise<PaginatedResult<DriverOrder>> {
  const response = await fetch(`${apiBase}/completed?email=${encodeURIComponent(email)}&page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch completed orders.');
  }

  return response.json();
}

export async function fetchActiveOrder(email: string): Promise<DriverOrder | null> {
  const response = await fetch(`${apiBase}/active?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch active order.');
  }

  const result = await response.json();
  return result ?? null;
}

export async function fetchAssignedOrder(orderId: string, email: string): Promise<DriverOrder> {
  const response = await fetch(`${apiBase}/${orderId}?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch assigned order.');
  }

  return response.json();
}

export async function updateOrderPhotos(orderId: string, email: string, field: string, photos: string | string[]): Promise<DriverOrder> {
  const response = await fetch(`${apiBase}/${orderId}/photos?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, photos }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update photos.');
  }

  return response.json();
}

export async function updateOrderStatus(orderId: string, status: string, email: string): Promise<DriverOrder> {
  const response = await fetch(`${apiBase}/${orderId}?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order status.');
  }

  return response.json();
}

export async function updateOrderCodAmount(orderId: string, codAmount: number, email: string): Promise<DriverOrder> {
  const response = await fetch(`${apiBase}/${orderId}/cod-amount?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codAmount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update COD amount.');
  }

  return response.json();
}
