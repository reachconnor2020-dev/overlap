import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';

export async function GET() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerCoupleId: coupleId }, { blockedCoupleId: coupleId }] },
  });
  const blockedIds = new Set(
    blocks.map((b) => (b.blockerCoupleId === coupleId ? b.blockedCoupleId : b.blockerCoupleId))
  );

  const matches = await prisma.match.findMany({
    where: { OR: [{ coupleAId: coupleId }, { coupleBId: coupleId }] },
    include: {
      coupleA: { include: { people: true } },
      coupleB: { include: { people: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const shaped = matches
    .filter((m) => {
      const otherId = m.coupleAId === coupleId ? m.coupleBId : m.coupleAId;
      return !blockedIds.has(otherId);
    })
    .map((m) => {
      const other = m.coupleAId === coupleId ? m.coupleB : m.coupleA;
      return {
        matchId: m.id,
        score: m.score,
        createdAt: m.createdAt,
        otherCouple: {
          id: other.id,
          displayName: other.displayName,
          photoUrl: other.photoUrl,
          people: other.people.map((p) => p.name),
        },
        lastMessage: m.messages[0] ?? null,
      };
    });

  return NextResponse.json(shaped);
}
