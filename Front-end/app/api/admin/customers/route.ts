import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams(searchParams);
  const queryString = params.toString();
  const url = `${backendBaseUrl}/admin/customers${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
