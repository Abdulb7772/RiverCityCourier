import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET() {
  const response = await fetch(`${backendBaseUrl}/admin/drivers`, {
    cache: 'no-store',
  });

  const payload = await response.json();

  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/admin/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create driver.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
