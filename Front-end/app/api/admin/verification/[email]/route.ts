import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  try {
    const response = await fetch(`${backendBaseUrl}/admin/verification/${encodeURIComponent(email)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) return NextResponse.json(payload);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch verification.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const body = await request.json();
  try {
    const response = await fetch(`${backendBaseUrl}/admin/verification/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) return NextResponse.json(payload);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update document status.' }, { status: 500 });
  }
}
