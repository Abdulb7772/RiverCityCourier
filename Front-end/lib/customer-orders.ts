export type CustomerOrderStatus = 'new' | 'accepted' | 'arrived_at_pickup' | 'picked_up' | 'in_transit' | 'arrived_at_destination' | 'completed' | 'rejected';

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  status: CustomerOrderStatus;
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

export type CreateOrderInput = {
  customer: string;
  customerEmail?: string;
  pickup: string;
  destination: string;
  priority?: string;
  paymentMethod?: string;
  eta?: string;
  packageType?: string;
  distance?: string;
  contact?: string;
  note?: string;
  pickupName?: string;
  pickupContact?: string;
  pickupItems?: string;
  pickupQuantity?: string;
  pickupVehicleType?: string;
  deliveryName?: string;
  deliveryContact?: string;
  deliveryItems?: string;
  deliveryQuantity?: string;
  deliveryVehicleType?: string;
  pickupDate?: string;
  deliveryDate?: string;
  pickupTime?: string;
  deliveryTime?: string;
};

export async function fetchCustomerOrders(customerEmail: string, customerName?: string): Promise<CustomerOrder[]> {
  const params = new URLSearchParams();
  params.set('customerEmail', customerEmail);
  if (customerName) params.set('customer', customerName);
  const response = await fetch(`/api/customer/orders?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch orders.');
  }
  return response.json();
}

export async function fetchCustomerOrder(orderId: string): Promise<CustomerOrder> {
  const response = await fetch(`/api/customer/orders/${orderId}`, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order.');
  }
  return response.json();
}

export async function updateCustomerOrderStatus(orderId: string, status: CustomerOrderStatus): Promise<CustomerOrder> {
  const response = await fetch(`/api/customer/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order.');
  }

  return response.json();
}

export async function updateCustomerOrder(
  orderId: string,
  data: Partial<Omit<CreateOrderInput, 'customer' | 'customerEmail'>>,
): Promise<CustomerOrder> {
  const response = await fetch(`/api/customer/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order.');
  }

  return response.json();
}

export async function createCustomerOrder(input: CreateOrderInput): Promise<CustomerOrder> {
  const response = await fetch('/api/customer/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order.');
  }

  return response.json();
}