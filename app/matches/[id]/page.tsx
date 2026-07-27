'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Button from '@/components/Button';

type Message = { id: string; senderCoupleId: string; body: string; createdAt: string };

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/messages/${params.id}`);
      if (!res.ok || cancelled) return;
      setMessages(await res.json());
    }

    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
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
      setMessages((prev) => [...prev, message]);
      setText('');
    }
    setSending(false);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="max-w-[75%] rounded-2xl border border-line bg-white/50 px-4 py-2 text-sm">
              {m.body}
            </div>
          ))}
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
    </main>
  );
}
