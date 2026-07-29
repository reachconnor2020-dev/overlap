'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/password-reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
    }
  }

  if (done) {
    return (
      <p className="font-display text-xl italic">
        Password updated — taking you to log in…
      </p>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl italic">Enter your reset code</h1>
      <p className="mt-2 text-sm text-ink/70">
        Check your email for the 6-digit code, then choose a new password.
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">6-digit code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            maxLength={6}
            required
            className="rounded-lg border border-line bg-paper px-3 py-2 text-center font-mono text-xl tracking-[0.3em] outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">New password</span>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            minLength={8}
            required
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
          />
        </label>

        {error && <p className="text-sm text-circleB">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/70">
        Didn't get a code?{' '}
        <Link href="/forgot-password" className="font-medium underline">
          Send another
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg italic">
        Overlap
      </Link>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
