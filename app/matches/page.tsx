'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

type MatchSummary = {
  matchId: string;
  score: number;
  otherCouple: { id: string; displayName: string; photoUrl: string | null; people: string[] };
  lastMessage: { body: string } | null;
};

function initials(name: string) {
  return name
    .split(/\s|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[] | null>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then(setMatches);
  }, []);

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl italic">Your matches</h1>

        {matches && matches.length === 0 && (
          <p className="mt-6 text-sm text-ink/70">
            No matches yet —{' '}
            <Link href="/discover" className="underline">
              go find some couples
            </Link>
            .
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {matches?.map((m) => (
            <Link
              key={m.matchId}
              href={`/matches/${m.matchId}`}
              className="group flex items-center gap-4 rounded-card border border-transparent bg-white/40 px-5 py-4 transition-colors hover:border-line"
            >
              {m.otherCouple.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.otherCouple.photoUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border-2 border-paper object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-paper bg-circleAsoft font-display text-sm italic text-ink">
                  {initials(m.otherCouple.displayName)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg">{m.otherCouple.displayName}</h2>
                <p className="truncate text-sm text-ink/60">
                  {m.lastMessage ? m.lastMessage.body : 'Say hello'}
                </p>
              </div>

              <span className="shrink-0 font-mono text-xs text-teal">{m.score}%</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
