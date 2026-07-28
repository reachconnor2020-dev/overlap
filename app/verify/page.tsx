'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function VerifyPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    setLoading(false);

    if (res.ok) {
      await update();
      router.push('/onboarding');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    const res = await fetch('/api/verify/resend', { method: 'POST' });
    setResending(false);
    if (res.ok) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } else {
      setError('Could not resend a code. Try again in a moment.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg italic">
        Overlap
      </Link>
      <h1 className="font-display text-3xl italic">Check your email</h1>
      <p className="mt-2 text-sm text-ink/70">
        We sent a 6-digit code to your email. Enter it below to verify your
        account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="rounded-lg border border-line bg-paper px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-ink"
        />

        {error && <p className="text-sm text-circleB">{error}</p>}
        {sent && <p className="text-sm text-teal">New code sent — check your inbox.</p>}

        <Button type="submit" disabled={loading || code.length !== 6}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="mt-6 text-sm font-medium underline disabled:opacity-40"
      >
        {resending ? 'Sending…' : "Didn't get a code? Resend"}
      </button>
    </main>
  );
}
