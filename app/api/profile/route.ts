import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { profileSchema } from '@/lib/validators';

export async function GET() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: {
      people: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(couple);
}

export async function PATCH(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { city, latitude, longitude, bio, photoUrl, tags } = parsed.data;

  await prisma.$transaction([
    prisma.couple.update({
      where: { id: coupleId },
      data: {
        city,
        latitude,
        longitude,
        bio,
        photoUrl: photoUrl || undefined,
        onboarded: true,
      },
    }),
    prisma.coupleTag.deleteMany({ where: { coupleId } }),
    prisma.coupleTag.createMany({
      data: tags.map((t) => ({ coupleId, tagId: t.tagId, weight: t.weight })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
