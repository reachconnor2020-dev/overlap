import { prisma } from '@/lib/prisma';
import { resend, EMAIL_FROM } from '@/lib/resend';

const CODE_TTL_MINUTES = 10;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueVerificationCode(coupleId: string, email: string, displayName: string) {
  const code = generateCode();
  const expires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.couple.update({
    where: { id: coupleId },
    data: { verificationCode: code, verificationCodeExpires: expires },
  });

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `${code} is your Overlap verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="font-style: italic;">Overlap</h2>
        <p>Hi ${displayName},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 600; letter-spacing: 4px;">${code}</p>
        <p style="color: #666; font-size: 14px;">This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function checkVerificationCode(coupleId: string, submittedCode: string): Promise<boolean> {
  const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
  if (!couple?.verificationCode || !couple.verificationCodeExpires) return false;
  if (couple.verificationCodeExpires < new Date()) return false;
  if (couple.verificationCode !== submittedCode.trim()) return false;

  await prisma.couple.update({
    where: { id: coupleId },
    data: { emailVerified: true, verificationCode: null, verificationCodeExpires: null },
  });

  return true;
}
