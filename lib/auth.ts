import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { codeRateLimit } from '@/lib/rate-limit';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { success } = await codeRateLimit.limit(`login:${credentials.email.toLowerCase()}`);
        if (!success) {
          throw new Error('Too many attempts — please wait a few minutes and try again.');
        }

        const couple = await prisma.couple.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!couple) return null;

        const valid = await bcrypt.compare(credentials.password, couple.passwordHash);
        if (!valid) return null;

        return {
          id: couple.id,
          email: couple.email,
          name: couple.displayName,
          emailVerified: couple.emailVerified,
          onboarded: couple.onboarded,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.coupleId = user.id;
        token.emailVerified = (user as { emailVerified?: boolean }).emailVerified;
        token.onboarded = (user as { onboarded?: boolean }).onboarded;
      }
      if (trigger === 'update') {
        const fresh = await prisma.couple.findUnique({ where: { id: token.coupleId as string } });
        if (fresh) {
          token.emailVerified = fresh.emailVerified;
          token.onboarded = fresh.onboarded;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.coupleId as string;
        (session.user as { emailVerified?: boolean }).emailVerified = token.emailVerified as boolean;
        (session.user as { onboarded?: boolean }).onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
