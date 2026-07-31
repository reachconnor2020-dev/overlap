'use client';

import { useState } from 'react';
import Button from '@/components/Button';

const REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment or abuse' },
  { value: 'FAKE_PROFILE', label: 'Fake profile' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate photos or content' },
  { value: 'OTHER', label: 'Other' },
] as const;

type ReportBlockModalProps = {
  coupleId: string;
  coupleName: string;
  onClose: () => void;
  onBlocked: () => void;
};

export default function ReportBlockModal({ coupleId, coupleName, onClose, onBlocked }: ReportBlockModalProps) {
  const [reason, setReason] = useState<(typeof REASONS)[number]['value'] | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    if (reason) {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleId, reason, details: details || undefined }),
      });
    }

    if (alsoBlock) {
      await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleId }),
      });
    }

    setSubmitting(false);
    setDone(true);

    if (alsoBlock) {
      setTimeout(onBlocked, 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6">
      <div className="w-full max-w-sm rounded-card bg-paper p-6">
        {done ? (
          <p className="text-center font-display text-lg italic">
            {alsoBlock ? `${coupleName} has been blocked.` : 'Thanks — your report has been sent.'}
          </p>
        ) : (
          <>
            <h2 className="font-display text-xl italic">Report or block</h2>
            <p className="mt-1 text-sm text-ink/60">Regarding {coupleName}</p>

            <div className="mt-4 flex flex-col gap-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            {reason && (
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Any extra detail that would help us look into this (optional)"
                rows={2}
                maxLength={1000}
                className="mt-3 w-full rounded-lg border border-line bg-white/60 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            )}

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} />
              Also block this couple — they'll disappear from your matches and can't message you
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="text-sm text-ink/60 hover:underline">
                Cancel
              </button>
              <Button onClick={handleSubmit} disabled={submitting || (!reason && !alsoBlock)}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
