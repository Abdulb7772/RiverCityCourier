import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET() {
  try {
    const response = await fetch(`${backendBaseUrl}/admin/verification`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    if (response.ok) return NextResponse.json(payload);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch verifications.' }, { status: 500 });
  }
}
