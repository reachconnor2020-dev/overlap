'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import Button from '@/components/Button';
import PhotoUpload from '@/components/PhotoUpload';
import LocationPicker from '@/components/LocationPicker';

type Tag = { id: string; label: string; category: 'INTEREST' | 'HOBBY' | 'VALUE' | 'POLITICS' };
type CoupleTag = { tagId: string; weight: number; tag: Tag };
type CoupleProfile = {
  displayName: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  bio: string | null;
  photoUrl: string | null;
  people: { name: string }[];
  tags: CoupleTag[];
};

const CATEGORY_LABELS: Record<Tag['category'], string> = {
  HOBBY: 'Hobbies',
  INTEREST: 'Interests',
  VALUE: 'Values & lifestyle',
  POLITICS: 'Politics',
};

export default function ProfilePage() {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/tags').then((r) => r.json()),
      fetch('/api/profile').then((r) => r.json()),
    ]).then(([tags, prof]: [Tag[], CoupleProfile]) => {
      setAllTags(tags);
      setProfile(prof);
      setCity(prof.city ?? '');
      setCoords({ lat: prof.latitude ?? undefined, lng: prof.longitude ?? undefined });
      setBio(prof.bio ?? '');
      setPhotoUrl(prof.photoUrl ?? '');
      setSelected(new Map(prof.tags.map((t) => [t.tagId, t.weight])));
    });
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

  function handleLocationChange(newCity: string, lat?: number, lng?: number) {
    setCity(newCity);
    if (lat !== undefined && lng !== undefined) setCoords({ lat, lng });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        latitude: coords.lat,
        longitude: coords.lng,
        bio,
        photoUrl,
        tags: [...selected.entries()].map(([tagId, weight]) => ({ tagId, weight })),
      }),
    });
    setSaving(false);
    if (res.ok) setSavedAt(Date.now());
  }

  const grouped = allTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    (acc[tag.category] ??= []).push(tag);
    return acc;
  }, {});

  if (!profile) {
    return (
      <main className="min-h-screen">
        <NavBar />
        <p className="mx-auto max-w-2xl px-6 py-16 text-ink/60">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-3xl italic">{profile.displayName}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {profile.people.map((p) => p.name).join(' & ')}
        </p>

        <div className="mt-8 flex flex-col gap-6">
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
          <LocationPicker city={city} onChange={handleLocationChange} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={600}
              className="rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
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

        <div className="mt-10 flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {savedAt && <span className="text-sm text-teal">Saved</span>}
        </div>
      </div>
    </main>
  );
}
