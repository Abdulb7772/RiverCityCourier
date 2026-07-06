import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET() {
  const response = await fetch(`${backendBaseUrl}/admin/notifications`, { cache: 'no-store' });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
