import { NextResponse } from 'next/server';
import { issuePasswordResetCode } from '@/lib/passwordReset';
import { ipRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const { success } = await ipRateLimit.limit(`reset-request:${getClientIp(req)}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    await issuePasswordResetCode(email);
  } catch {
    // Swallow send failures here too, so this endpoint can't be used to
    // check which emails are registered.
  }

  return NextResponse.json({ ok: true });
}
