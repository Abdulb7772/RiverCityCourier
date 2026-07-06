import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

const fallback = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams(searchParams);
  const queryString = params.toString();
  const url = `${backendBaseUrl}/admin/activity${queryString ? `?${queryString}` : ''}`;
  try {
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
    return NextResponse.json(fallback);
  }
}
