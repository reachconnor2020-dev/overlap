'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import Button from '@/components/Button';
import VennMark from '@/components/VennMark';

type Candidate = {
  id: string;
  displayName: string;
  city: string | null;
  bio: string | null;
  photoUrl: string | null;
  people: string[];
  score: number;
  sharedTags: string[];
};

export default function DiscoverPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [index, setIndex] = useState(0);
  const [matchedWith, setMatchedWith] = useState<Candidate | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/discover')
      .then((r) => r.json())
      .then((data) => setCandidates(Array.isArray(data) ? data : []));
  }, []);

  const current = candidates?.[index];

  async function swipe(direction: 'PASS' | 'LIKE') {
    if (!current || busy) return;
    setBusy(true);

    const res = await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toCoupleId: current.id, direction }),
    });
    const data = await res.json();

    setBusy(false);
    setIndex((i) => i + 1);

    if (data.matched) {
      setMatchedWith(current);
    }
  }

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-md px-6 py-16">
        {!candidates && <p className="text-center text-ink/60">Finding couples nearby…</p>}

        {candidates && candidates.length === 0 && (
          <div className="text-center">
            <p className="font-display text-2xl italic">That's everyone for now.</p>
            <p className="mt-2 text-sm text-ink/70">
              Check back later, or widen what you're open to in your profile.
            </p>
          </div>
        )}

        {candidates && current && (
          <div className="rounded-card border border-line bg-white/40 p-6 shadow-sm">
            {current.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photoUrl}
                alt=""
                className="mb-4 h-56 w-full rounded-lg object-cover"
              />
            )}
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl italic">{current.displayName}</h2>
              <span className="font-mono text-xs text-teal">{current.score}% overlap</span>
            </div>
            {current.city && <p className="mt-1 text-sm text-ink/60">{current.city}</p>}
            {current.bio && <p className="mt-4 text-sm text-ink/80">{current.bio}</p>}

            {current.sharedTags.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/50">
                  You both said
                </p>
                <div className="flex flex-wrap gap-2">
                  {current.sharedTags.map((t) => (
                    <span key={t} className="tag-chip" data-active="true">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="secondary" onClick={() => swipe('PASS')} disabled={busy}>
                Pass
              </Button>
              <Button onClick={() => swipe('LIKE')} disabled={busy}>
                Say hi
              </Button>
            </div>
          </div>
        )}
      </div>

      {matchedWith && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6">
          <div className="w-full max-w-sm rounded-card bg-paper p-8 text-center">
            <VennMark
              size={180}
              overlapLabel={matchedWith.sharedTags.slice(0, 3).join(', ')}
            />
            <h2 className="mt-4 font-display text-2xl italic">It's a match!</h2>
            <p className="mt-2 text-sm text-ink/70">
              You and {matchedWith.displayName} both said hi. Start the
              conversation.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setMatchedWith(null)}>
                Keep browsing
              </Button>
              <a href="/matches">
                <Button>Go to chat</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
