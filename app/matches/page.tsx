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

        <div className="mt-8 flex flex-col divide-y divide-line">
          {matches?.map((m) => (
            <Link
              key={m.matchId}
              href={`/matches/${m.matchId}`}
              className="flex items-center justify-between py-4 hover:bg-paperDim/60"
            >
              <div>
                <p className="font-display text-lg">{m.otherCouple.displayName}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {m.lastMessage ? m.lastMessage.body : 'Say hello'}
                </p>
              </div>
              <span className="font-mono text-xs text-teal">{m.score}%</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
