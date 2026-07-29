import { prisma } from '@/lib/prisma';
import { resend, EMAIL_FROM } from '@/lib/resend';

const CODE_TTL_MINUTES = 15;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issuePasswordResetCode(email: string) {
  const couple = await prisma.couple.findUnique({ where: { email: email.toLowerCase() } });
  if (!couple) return;

  const code = generateCode();
  const expires = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.couple.update({
    where: { id: couple.id },
    data: { passwordResetCode: code, passwordResetCodeExpires: expires },
  });

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: couple.email,
    subject: `${code} is your Overlap password reset code`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="font-style: italic;">Overlap</h2>
        <p>Hi ${couple.displayName},</p>
        <p>Use this code to reset your password:</p>
        <p style="font-size: 32px; font-weight: 600; letter-spacing: 4px;">${code}</p>
        <p style="color: #666; font-size: 14px;">This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email — your password won't change.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

export async function checkPasswordResetCode(email: string, submittedCode: string): Promise<boolean> {
  const couple = await prisma.couple.findUnique({ where: { email: email.toLowerCase() } });
  if (!couple?.passwordResetCode || !couple.passwordResetCodeExpires) return false;
  if (couple.passwordResetCodeExpires < new Date()) return false;
  return couple.passwordResetCode === submittedCode.trim();
}

export async function consumePasswordResetCode(email: string, newPasswordHash: string) {
  await prisma.couple.update({
    where: { email: email.toLowerCase() },
    data: {
      passwordHash: newPasswordHash,
      passwordResetCode: null,
      passwordResetCodeExpires: null,
    },
  });
}
