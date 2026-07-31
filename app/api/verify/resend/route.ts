import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { issueVerificationCode } from '@/lib/verification';
import { codeRateLimit } from '@/lib/rate-limit';

export async function POST() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { success } = await codeRateLimit.limit(`resend:${coupleId}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
  if (!couple) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (couple.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  await issueVerificationCode(couple.id, couple.email, couple.displayName);

  return NextResponse.json({ ok: true });
}
