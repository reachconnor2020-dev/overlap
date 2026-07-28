import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { issueVerificationCode } from '@/lib/verification';

export async function POST() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
  if (!couple) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (couple.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  await issueVerificationCode(couple.id, couple.email, couple.displayName);

  return NextResponse.json({ ok: true });
}
