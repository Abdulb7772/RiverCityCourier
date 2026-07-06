import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const response = await fetch(`${backendBaseUrl}/admin/orders/${orderId}`, { cache: 'no-store' });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
