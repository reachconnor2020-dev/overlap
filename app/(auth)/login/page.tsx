'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email')),
      password: String(form.get('password')),
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/discover');
    } else {
      setError('Wrong email or password.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg italic">
        Overlap
      </Link>
      <h1 className="font-display text-3xl italic">Welcome back</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Password</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <Link href="/forgot-password" className="text-sm font-medium underline">
          Forgot password?
        </Link>
        {error && <p className="text-sm text-circleB">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/70">
        New here?{' '}
        <Link href="/signup" className="font-medium underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
