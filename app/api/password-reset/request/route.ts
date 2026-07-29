import { NextResponse } from 'next/server';
import { issuePasswordResetCode } from '@/lib/passwordReset';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    await issuePasswordResetCode(email);
  } catch {
    // Swallow failures here so this endpoint can't be used to check
    // which emails are registered — real failures still show in logs.
  }

  return NextResponse.json({ ok: true });
}
