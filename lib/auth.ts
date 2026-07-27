import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.coupleId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.coupleId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
