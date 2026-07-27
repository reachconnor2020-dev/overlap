import { TagCategory } from '@prisma/client';

export type TaggedCouple = {
  id: string;
  tags: { tagId: string; weight: number; tag: { label: string; category: TagCategory } }[];
};

/**
 * Simple weighted tag-overlap scoring, 0-100.
 *
 * - Every shared tag contributes points.
 * - A tag either couple marked as "matters a lot" (weight 2) contributes double.
 * - Politics tags are counted like any other category by default: this is a
 *   friendship app, not a dating app, so we don't secretly up-weight politics.
 *   If a couple cares about political alignment, they express that by setting
 *   weight=2 on their politics tags — the algorithm doesn't assume it for them.
 * - Score is normalized by the smaller couple's total tag weight, so a couple
 *   with only 5 tags set isn't penalized for not having 30.
 */
export function compatibilityScore(a: TaggedCouple, b: TaggedCouple): number {
  const aTags = new Map(a.tags.map((t) => [t.tagId, t.weight]));
  const bTags = new Map(b.tags.map((t) => [t.tagId, t.weight]));

  if (aTags.size === 0 || bTags.size === 0) return 0;

  let sharedPoints = 0;
  for (const [tagId, weightA] of aTags) {
    const weightB = bTags.get(tagId);
    if (weightB) {
      sharedPoints += weightA + weightB;
    }
  }

  const aTotal = [...aTags.values()].reduce((sum, w) => sum + w, 0) * 2;
  const bTotal = [...bTags.values()].reduce((sum, w) => sum + w, 0) * 2;
  const denominator = Math.min(aTotal, bTotal);

  const raw = denominator > 0 ? sharedPoints / denominator : 0;
  return Math.round(Math.min(raw, 1) * 100);
}

export function sharedTagLabels(a: TaggedCouple, b: TaggedCouple): string[] {
  const bTagIds = new Set(b.tags.map((t) => t.tagId));
  return a.tags.filter((t) => bTagIds.has(t.tagId)).map((t) => t.tag.label);
}
