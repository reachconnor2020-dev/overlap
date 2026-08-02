'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import Button from '@/components/Button';
import ReportBlockModal from '@/components/ReportBlockModal';
import { getPusherClient } from '@/lib/pusher-client';

type Message = { id: string; senderCoupleId: string; body: string; createdAt: string };
type MatchSummary = {
  matchId: string;
  otherCouple: { id: string; displayName: string; photoUrl: string | null; people: string[] };
};

function initials(name: string) {
  return name
    .split(/\s|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const myCoupleId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then((all: MatchSummary[]) => {
        const found = all.find((m) => m.matchId === params.id);
        setMatch(found ?? null);
      });
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/messages/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data);
      });

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`match-${params.id}`);

    channel.bind('new-message', (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      cancelled = true;
      channel.unbind_all();
      pusher.unsubscribe(`match-${params.id}`);
    };
  }, [params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);

    const res = await fetch(`/api/messages/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text.trim() }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setText('');
    }
    setSending(false);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />

      {match && (
        <div className="border-b border-line px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <div className="flex items-center gap-3">
              {match.otherCouple.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={match.otherCouple.photoUrl}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-circleAsoft font-display text-sm italic text-ink">
                  {initials(match.otherCouple.displayName)}
                </div>
              )}
              <div>
                <h1 className="font-display text-lg italic leading-tight">{match.otherCouple.displayName}</h1>
                {match.otherCouple.people.length > 0 && (
                  <p className="text-xs text-ink/50">{match.otherCouple.people.join(' & ')}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-ink/50 hover:text-circleB"
            >
              Report or block
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-6">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {messages.map((m) => {
            const isMine = m.senderCoupleId === myCoupleId;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? 'rounded-br-sm bg-ink text-paper'
                      : 'rounded-bl-sm border border-line bg-white/50 text-ink'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something…"
            className="flex-1 rounded-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <Button type="submit" disabled={sending}>
            Send
          </Button>
        </form>
      </div>

      {showModal && match && (
        <ReportBlockModal
          coupleId={match.otherCouple.id}
          coupleName={match.otherCouple.displayName}
          onClose={() => setShowModal(false)}
          onBlocked={() => router.push('/matches')}
        />
      )}
    </main>
  );
}
