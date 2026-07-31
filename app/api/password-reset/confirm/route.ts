import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkPasswordResetCode, consumePasswordResetCode } from '@/lib/passwordReset';
import { codeRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check your inputs and try again.' }, { status: 400 });
  }

  const { email, code, newPassword } = parsed.data;

  const { success } = await codeRateLimit.limit(`reset-confirm:${email.toLowerCase()}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const valid = await checkPasswordResetCode(email, code);
  if (!valid) {
    return NextResponse.json({ error: 'That code is wrong or expired.' }, { status: 400 });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await consumePasswordResetCode(email, newPasswordHash);

  return NextResponse.json({ ok: true });
}
