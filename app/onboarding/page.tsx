'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

type Tag = { id: string; label: string; category: 'INTEREST' | 'HOBBY' | 'VALUE' | 'POLITICS' };

const CATEGORY_LABELS: Record<Tag['category'], string> = {
  HOBBY: 'Hobbies',
  INTEREST: 'Interests',
  VALUE: 'Values & lifestyle',
  POLITICS: 'Politics',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then(setTags);
  }, []);

  function toggleTag(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return next;
    });
  }

  function toggleWeight(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) next.set(id, current === 1 ? 2 : 1);
      return next;
    });
  }

  async function handleSubmit() {
    setError(null);
    if (selected.size < 3) {
      setError('Pick at least 3 tags so we can find couples you overlap with.');
      return;
    }
    setSaving(true);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        bio,
        photoUrl,
        tags: [...selected.entries()].map(([tagId, weight]) => ({ tagId, weight })),
      }),
    });

    setSaving(false);

    if (res.ok) {
      router.push('/discover');
    } else {
      setError('Something went wrong saving your profile.');
    }
  }

  const grouped = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    (acc[tag.category] ??= []).push(tag);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl italic">Tell us about you two</h1>
      <p className="mt-2 text-sm text-ink/70">
        This is what we use to find couples you'll actually get along with.
        Tap a tag to select it, tap again on a selected tag to mark it as
        something that matters a lot to you.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
            placeholder="San Diego, CA"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={600}
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
            placeholder="A couple of sentences about you two — what you're into, what you're looking for in couple friends."
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Photo URL (optional)</span>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
            placeholder="https://…"
          />
        </label>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {(Object.keys(CATEGORY_LABELS) as Tag['category'][]).map((category) => (
          <div key={category}>
            <h2 className="font-display text-lg italic">{CATEGORY_LABELS[category]}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(grouped[category] ?? []).map((tag) => {
                const weight = selected.get(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    data-active={weight ? 'true' : 'false'}
                    className="tag-chip"
                    onClick={() => toggleTag(tag.id)}
                    onDoubleClick={() => toggleWeight(tag.id)}
                    title={weight === 2 ? 'Matters a lot — click again to reset' : 'Double-click to mark as "matters a lot"'}
                  >
                    {tag.label}
                    {weight === 2 && <span aria-hidden>★</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-circleB">{error}</p>}

      <div className="mt-10">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Start discovering couples'}
        </Button>
      </div>
    </main>
  );
}
