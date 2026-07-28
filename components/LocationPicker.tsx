'use client';

import { useState } from 'react';

type LocationPickerProps = {
  city: string;
  onChange: (city: string, latitude?: number, longitude?: number) => void;
};

export default function LocationPicker({ city, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Location isn\u2019t available in this browser — type your city instead.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: 'application/json' } }
          );
          const data = await res.json();
          const address = data.address ?? {};
          const label =
            [address.city || address.town || address.village, address.state]
              .filter(Boolean)
              .join(', ') || data.display_name || 'Location found';
          onChange(label, latitude, longitude);
        } catch {
          onChange(city, latitude, longitude);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Couldn\u2019t get your location — check your browser permissions, or type your city instead.');
        setLoading(false);
      }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-ink/70">City</span>
      <div className="flex gap-2">
        <input
          value={city}
          onChange={(e) => onChange(e.target.value)}
          placeholder="San Diego, CA"
          className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="whitespace-nowrap rounded-lg border border-ink px-3 py-2 text-sm font-medium hover:bg-ink hover:text-paper disabled:opacity-40"
        >
          {loading ? 'Locating…' : 'Use my location'}
        </button>
      </div>
      {error && <p className="text-sm text-circleB">{error}</p>}
      <p className="text-xs text-ink/50">
        Sharing your precise location lets us show distance to other couples.
        You can also just type a city — that's used for display only.
      </p>
    </div>
  );
}
