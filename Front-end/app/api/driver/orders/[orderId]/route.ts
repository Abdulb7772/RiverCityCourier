import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = `${backendBaseUrl}/driver/orders/${orderId}${qs ? `?${qs}` : ''}`;
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) return NextResponse.json(payload);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const body = await request.json();
  const url = `${backendBaseUrl}/driver/orders/${orderId}${qs ? `?${qs}` : ''}`;
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) return NextResponse.json(payload);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
