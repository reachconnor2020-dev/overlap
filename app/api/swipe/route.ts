import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { swipeSchema } from '@/lib/validators';
import { compatibilityScore } from '@/lib/matching';

export async function POST(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const parsed = swipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { toCoupleId, direction } = parsed.data;

  if (toCoupleId === coupleId) {
    return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 });
  }

  await prisma.swipe.upsert({
    where: { fromCoupleId_toCoupleId: { fromCoupleId: coupleId, toCoupleId } },
    update: { direction },
    create: { fromCoupleId: coupleId, toCoupleId, direction },
  });

  let matched = false;
  let matchId: string | null = null;

  if (direction === 'LIKE') {
    const reciprocal = await prisma.swipe.findUnique({
      where: { fromCoupleId_toCoupleId: { fromCoupleId: toCoupleId, toCoupleId: coupleId } },
    });

    if (reciprocal?.direction === 'LIKE') {
      const [a, b] = [coupleId, toCoupleId].sort();

      const [coupleA, coupleB] = await Promise.all([
        prisma.couple.findUnique({ where: { id: a }, include: { tags: { include: { tag: true } } } }),
        prisma.couple.findUnique({ where: { id: b }, include: { tags: { include: { tag: true } } } }),
      ]);

      const score = coupleA && coupleB ? compatibilityScore(coupleA, coupleB) : 0;

      const match = await prisma.match.upsert({
        where: { coupleAId_coupleBId: { coupleAId: a, coupleBId: b } },
        update: {},
        create: { coupleAId: a, coupleBId: b, score },
      });

      matched = true;
      matchId = match.id;
    }
  }

  return NextResponse.json({ ok: true, matched, matchId });
}
