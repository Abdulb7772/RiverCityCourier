import Credentials from 'next-auth/providers/credentials';
import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:4000/api';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Partial<Record<'email' | 'password', string>> | undefined) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${backendBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as { user?: { id: string; fullName: string; email: string; role?: string } };
        const user = payload.user;

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role ?? 'customer',
        } satisfies User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role ?? 'customer';
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.role = (token.role as string | undefined) ?? session.user.role ?? 'customer';
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'rivercitycourier-dev-secret',
};