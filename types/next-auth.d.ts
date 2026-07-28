import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      emailVerified?: boolean;
      onboarded?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    coupleId?: string;
    emailVerified?: boolean;
    onboarded?: boolean;
  }
}
