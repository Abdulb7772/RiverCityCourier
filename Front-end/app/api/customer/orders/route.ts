import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer = searchParams.get('customer');
    const customerEmail = searchParams.get('customerEmail');

    const params = new URLSearchParams();
    if (customer) params.set('customer', customer);
    if (customerEmail) params.set('customerEmail', customerEmail);

    const queryString = params.toString();
    const url = queryString
      ? `${backendBaseUrl}/admin/orders?${queryString}`
      : `${backendBaseUrl}/admin/orders`;

    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) {
      return NextResponse.json(payload);
    }
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/admin/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}