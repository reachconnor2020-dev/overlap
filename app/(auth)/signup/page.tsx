'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get('email')),
      password: String(form.get('password')),
      displayName: String(form.get('displayName')),
      personAName: String(form.get('personAName')),
      personBName: String(form.get('personBName')),
    };

    const res = await fetch('/api/couples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }

    const signInRes = await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.ok) {
      router.push('/onboarding');
    } else {
      router.push('/login');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg italic">
        Overlap
      </Link>
      <h1 className="font-display text-3xl italic">Create your couple's account</h1>
      <p className="mt-2 text-sm text-ink/70">
        One account for both of you. You'll build your shared profile next.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Your name" name="personAName" required />
          <Field label="Their name" name="personBName" required />
        </div>
        <Field label="What should we call you two?" name="displayName" placeholder="Sam & Jordan" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" minLength={8} required />

        {error && <p className="text-sm text-circleB">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink/70">
        Already have an account?{' '}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  minLength,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
      />
    </label>
  );
}
