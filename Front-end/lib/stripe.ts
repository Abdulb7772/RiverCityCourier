export type CreateCheckoutInput = {
  customer: string;
  customerEmail?: string;
  pickup: string;
  destination: string;
  contact?: string;
  packageType?: string;
  pickupName?: string;
  pickupContact?: string;
  pickupItems?: string;
  pickupQuantity?: string;
  pickupVehicleType?: string;
  deliveryName?: string;
  deliveryContact?: string;
  deliveryItems?: string;
  deliveryQuantity?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  pickupDate?: string;
  pickupTime?: string;
  total: number;
};

export type CreateCheckoutResponse = {
  url: string;
  sessionId: string;
  orderId: string;
};

const stripeApiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function createCheckoutSession(data: CreateCheckoutInput): Promise<CreateCheckoutResponse> {
  const response = await fetch(`${stripeApiBaseUrl}/stripe/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session.');
  }
  return response.json();
}

export async function confirmPayment(sessionId: string) {
  const response = await fetch(`${stripeApiBaseUrl}/stripe/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to confirm payment.');
  }
  return response.json();
}
