import { NextResponse } from 'next/server';
import { getCurrentCoupleId } from '@/lib/session';
import { checkVerificationCode } from '@/lib/verification';

export async function POST(req: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const ok = await checkVerificationCode(coupleId, code);
  if (!ok) {
    return NextResponse.json({ error: 'That code is wrong or expired.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
