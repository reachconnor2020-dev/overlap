import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';

export async function GET() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { OR: [{ coupleAId: coupleId }, { coupleBId: coupleId }] },
    include: {
      coupleA: { include: { people: true } },
      coupleB: { include: { people: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const shaped = matches.map((m) => {
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
