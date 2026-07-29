'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg italic">
        Overlap
      </Link>
      <h1 className="font-display text-3xl italic">Reset your password</h1>
      <p className="mt-2 text-sm text-ink/70">
        Enter your account email and we'll send a code to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/70">
        <Link href="/login" className="font-medium underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
