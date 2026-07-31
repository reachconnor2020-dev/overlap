import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { compatibilityScore, sharedTagLabels } from '@/lib/matching';
import { milesBetween } from '@/lib/geo';

export async function GET() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const me = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: { tags: { include: { tag: true } } },
  });
  if (!me) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

  const alreadySwiped = await prisma.swipe.findMany({
    where: { fromCoupleId: coupleId },
    select: { toCoupleId: true },
  });
  const swipedIds = new Set(alreadySwiped.map((s) => s.toCoupleId));

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerCoupleId: coupleId }, { blockedCoupleId: coupleId }] },
  });
  const blockedIds = new Set(
    blocks.map((b) => (b.blockerCoupleId === coupleId ? b.blockedCoupleId : b.blockerCoupleId))
  );

  const candidates = await prisma.couple.findMany({
    where: {
      id: { not: coupleId, notIn: [...swipedIds, ...blockedIds] },
      onboarded: true,
    },
    include: {
      people: true,
      tags: { include: { tag: true } },
    },
    take: 100,
  });

  const ranked = candidates
    .map((c) => ({
      id: c.id,
      displayName: c.displayName,
      city: c.city,
      bio: c.bio,
      photoUrl: c.photoUrl,
      people: c.people.map((p) => p.name),
      score: compatibilityScore(me, c),
      sharedTags: sharedTagLabels(me, c),
      distanceMiles:
        me.latitude != null && me.longitude != null && c.latitude != null && c.longitude != null
          ? Math.round(
              milesBetween(
                { latitude: me.latitude, longitude: me.longitude },
                { latitude: c.latitude, longitude: c.longitude }
              )
            )
          : null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  return NextResponse.json(ranked);
}
