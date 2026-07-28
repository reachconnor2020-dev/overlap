'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

type PhotoUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('That image is too large — please choose one under 8MB.');
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      onChange(blob.url);
    } catch {
      setError('Upload failed — please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-ink/70">Photo</span>
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-20 w-20 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink/40">
            No photo
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
      {error && <p className="text-sm text-circleB">{error}</p>}
    </div>
  );
}
