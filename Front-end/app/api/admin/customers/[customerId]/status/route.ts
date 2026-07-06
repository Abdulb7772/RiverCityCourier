import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export async function PATCH(request: Request, context: { params: Promise<{ customerId: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const response = await fetch(`${backendBaseUrl}/admin/customers/${params.customerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update customer status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
