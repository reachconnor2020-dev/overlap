import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators';
import { issueVerificationCode } from '@/lib/verification';
import { ipRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const { success } = await ipRateLimit.limit(`signup:${getClientIp(req)}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts — please wait a few minutes and try again.' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, displayName, personAName, personBName } = parsed.data;

  const existing = await prisma.couple.findUnique({ where: { email: email.toLowerCase() } });

  if (existing) {
    return NextResponse.json({ id: 'pending', email: email.toLowerCase() }, { status: 201 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const couple = await prisma.couple.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      people: {
        create: [{ name: personAName }, { name: personBName }],
      },
    },
  });

  await issueVerificationCode(couple.id, couple.email, couple.displayName);

  return NextResponse.json({ id: couple.id, email: couple.email }, { status: 201 });
}
