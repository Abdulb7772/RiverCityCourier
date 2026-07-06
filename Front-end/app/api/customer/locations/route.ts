import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email query parameter is required.' }, { status: 400 });
  }

  const response = await fetch(`${backendBaseUrl}/customer/locations?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });

  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/customer/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create location.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
