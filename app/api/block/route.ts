import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';

export async function POST(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { coupleId: targetId } = await req.json();
  if (!targetId || typeof targetId !== 'string' || targetId === coupleId) {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }

  await prisma.block.upsert({
    where: { blockerCoupleId_blockedCoupleId: { blockerCoupleId: coupleId, blockedCoupleId: targetId } },
    update: {},
    create: { blockerCoupleId: coupleId, blockedCoupleId: targetId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { coupleId: targetId } = await req.json();
  if (!targetId || typeof targetId !== 'string') {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }

  await prisma.block.deleteMany({
    where: { blockerCoupleId: coupleId, blockedCoupleId: targetId },
  });

  return NextResponse.json({ ok: true });
}
