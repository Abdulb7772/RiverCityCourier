import { NextResponse } from 'next/server';
import { z } from 'zod';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  role: z.enum(['customer', 'driver', 'admin']).default('customer'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required fields with valid values.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendBaseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    const payload = (await response.json()) as {
      user?: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role?: string;
      };
      error?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error ?? 'Unable to register account.' },
        { status: response.status },
      );
    }

    const user = payload.user;

    if (!user) {
      return NextResponse.json({ error: 'Unable to register account.' }, { status: 500 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role ?? parsed.data.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to register account.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}