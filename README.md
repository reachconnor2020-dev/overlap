# Overlap

A web app for couples to find other couples to be **strictly platonic** friends
with, matched on shared interests, hobbies, values, and politics.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma +
PostgreSQL + NextAuth (credentials-based auth).

## How matching works

Each couple account has one shared profile with a set of tags (hobbies,
interests, values, politics). A couple can mark any tag as "matters a lot,"
which doubles its weight. When you open Discover, every other onboarded
couple is scored against you with a simple weighted tag-overlap formula
(`lib/matching.ts`) and shown ranked highest-overlap-first, with the specific
shared tags surfaced on the card. Swiping "Say hi" on each other mutually
creates a Match and opens a chat. See `lib/matching.ts` for the scoring logic
— it's intentionally simple and easy to tune.

## Project structure

```
app/
  page.tsx                landing page
  (auth)/signup, login     account creation / sign in
  onboarding/               first-time profile + tag setup
  discover/                 swipe deck
  matches/, matches/[id]    match list + chat
  profile/                  edit your profile
  api/                      REST endpoints backing all of the above
lib/
  matching.ts              compatibility scoring algorithm
  auth.ts                  NextAuth config
  prisma.ts                Prisma client singleton
  validators.ts            zod input schemas
prisma/
  schema.prisma            data model
  seed.ts                  starter tag list (hobbies/interests/values/politics)
```

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up Postgres.** Any Postgres works — local, [Supabase](https://supabase.com),
   [Neon](https://neon.tech), or [Railway](https://railway.app) all have free
   tiers that work well for this.

3. **Environment variables** — copy `.env.example` to `.env` and fill in:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` locally

4. **Create the database schema and seed starter tags:**

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Deploying

The easiest path is [Vercel](https://vercel.com) for the app + a managed
Postgres (Vercel Postgres, Supabase, or Neon):

1. Push this repo to GitHub and import it in Vercel.
2. Add the same three environment variables in the Vercel project settings
   (use your production `NEXTAUTH_URL`).
3. Add a build step / one-off command to run `npx prisma migrate deploy`
   against your production database (Vercel's "Deploy Hooks" or a manual
   run from your machine both work), then `npm run db:seed` once.

## What's deliberately left simple (next steps)

This is a real, working foundation, not a finished product. Things you'll
likely want before a public launch:

- **Photo uploads** — currently profiles take a photo URL; wire up
  S3/Cloudinary/UploadThing for real uploads.
- **Email/identity verification** — there's no email verification or
  couple-identity check (e.g. confirming both partners consent to the
  account) yet.
- **Moderation & reporting** — no report/block flow yet; you'll want one
  before real users are messaging each other.
- **Real-time chat** — messages currently poll every few seconds; swap in
  Pusher/Ably/websockets for instant delivery.
- **Distance-based filtering** — `city` is stored as free text; consider
  geocoding it for a real "within N miles" filter in Discover.
- **Rate limiting** on the API routes before this is public.
