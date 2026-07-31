import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';

const schema = z.object({
  coupleId: z.string(),
  reason: z.enum(['SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'OTHER']),
  details: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 });
  }
  if (parsed.data.coupleId === coupleId) {
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  }

  await prisma.report.create({
    data: {
      reporterCoupleId: coupleId,
      reportedCoupleId: parsed.data.coupleId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  return NextResponse.json({ ok: true });
}
