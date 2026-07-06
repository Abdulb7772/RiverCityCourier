import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function GET(_request: Request, context: { params: Promise<{ customerId: string }> }) {
  const params = await context.params;
  const response = await fetch(`${backendBaseUrl}/admin/customers/${params.customerId}`, {
    cache: 'no-store',
  });

  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
