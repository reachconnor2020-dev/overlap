import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(60),
  personAName: z.string().min(1).max(40),
  personBName: z.string().min(1).max(40),
});

export const profileSchema = z.object({
  city: z.string().max(80).optional(),
  bio: z.string().max(600).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  tags: z
    .array(
      z.object({
        tagId: z.string(),
        weight: z.number().int().min(1).max(2),
      })
    )
    .max(40),
});

export const swipeSchema = z.object({
  toCoupleId: z.string(),
  direction: z.enum(['PASS', 'LIKE']),
});

export const messageSchema = z.object({
  matchId: z.string(),
  body: z.string().min(1).max(2000),
});
