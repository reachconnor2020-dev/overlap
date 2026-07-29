import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared testing domain — works immediately with no setup.
// Swap for a verified sending domain (e.g. hello@yourdomain.com) once
// you've added and verified one in the Resend dashboard.
export const EMAIL_FROM = 'Overlap <onboarding@coupleoverlap.com>';
