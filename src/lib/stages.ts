/**
 * Timing for a pinned, scroll-driven sequence.
 *
 * Each stage owns an equal slice of the section's scroll progress. Around every
 * boundary there is a handoff window: the outgoing stage fades out over the
 * first half of it, the incoming stage fades in over the second half. They
 * neither overlap (which reads as a rendering fault) nor leave a gap where the
 * copy area is blank.
 *
 * `stageIndex` deliberately switches at the middle of that window, so anything
 * driven by the index (the illustration, the progress rail) changes at the same
 * moment the copy does.
 *
 * The maths is written out rather than expressed as keyframe arrays so the
 * behaviour outside the section, where progress is pinned at 0 or 1, is
 * unambiguous.
 */
const HANDOFF = 0.32; // share of one stage spent changing over

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

type Bounds = {
  enterFrom: number;
  enterTo: number;
  leaveFrom: number;
  leaveTo: number;
  first: boolean;
  last: boolean;
};

function bounds(index: number, total: number): Bounds {
  const range = 1 / total;
  const half = (range * HANDOFF) / 2;

  return {
    enterFrom: index * range - half,
    enterTo: index * range + half,
    leaveFrom: (index + 1) * range - 3 * half,
    leaveTo: (index + 1) * range - half,
    first: index === 0,
    last: index === total - 1,
  };
}

/** 0 before the stage arrives, 1 while it owns the screen, 0 once it leaves. */
export function stagePresence(progress: number, index: number, total: number) {
  const b = bounds(index, total);
  const entering = b.first
    ? 1
    : smooth((progress - b.enterFrom) / (b.enterTo - b.enterFrom));
  const leaving = b.last
    ? 1
    : smooth((b.leaveTo - progress) / (b.leaveTo - b.leaveFrom));
  return Math.min(entering, leaving);
}

/** Vertical offset that matches the presence curve: in from below, out upward. */
export function stageOffset(
  progress: number,
  index: number,
  total: number,
  travel = 18,
) {
  const b = bounds(index, total);
  if (!b.first && progress < b.enterTo) {
    const t = smooth((progress - b.enterFrom) / (b.enterTo - b.enterFrom));
    return travel * (1 - t);
  }
  if (!b.last && progress > b.leaveFrom) {
    const t = smooth((progress - b.leaveFrom) / (b.leaveTo - b.leaveFrom));
    return -travel * 0.7 * t;
  }
  return 0;
}

export function stageIndex(progress: number, total: number) {
  const range = 1 / total;
  const half = (range * HANDOFF) / 2;
  const raw = Math.floor((progress + half) * total);
  return Math.min(total - 1, Math.max(0, raw));
}
