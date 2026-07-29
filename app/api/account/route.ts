import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';

export async function DELETE() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  // Cascading foreign keys in the schema take care of profile, tags,
  // swipes, matches, and messages — this one delete removes everything.
  await prisma.couple.delete({ where: { id: coupleId } });

  return NextResponse.json({ ok: true });
}
