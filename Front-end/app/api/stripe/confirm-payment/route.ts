import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/stripe/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to confirm payment.' }, { status: 500 });
  }
}
