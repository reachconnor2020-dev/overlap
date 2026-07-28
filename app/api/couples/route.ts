import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators';
import { issueVerificationCode } from '@/lib/verification';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, displayName, personAName, personBName } = parsed.data;

  const existing = await prisma.couple.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
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
