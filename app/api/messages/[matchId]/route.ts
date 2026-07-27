import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentCoupleId } from '@/lib/session';
import { messageSchema } from '@/lib/validators';

async function assertParticipant(matchId: string, coupleId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  if (match.coupleAId !== coupleId && match.coupleBId !== coupleId) return null;
  return match;
}

export async function GET(_req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { matchId } = await params;
  const match = await assertParticipant(matchId, coupleId);
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { matchId } = await params;
  const match = await assertParticipant(matchId, coupleId);
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = messageSchema.safeParse({ ...body, matchId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      matchId,
      senderCoupleId: coupleId,
      body: parsed.data.body,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
