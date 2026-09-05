"use client";

import {
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

type Spring = { stiffness: number; damping: number };

/** Follows a flick promptly while softening the small steps from a mouse wheel. */
const DEFAULT_SPRING: Spring = { stiffness: 180, damping: 32 };

/**
 * Reserve scroll distance for an opening and a finished frame before release.
 *
 * A scene with little to do, like the coach's slow turn, can pass a heavier
 * spring so that each wheel notch eases it on rather than nudging it.
 */
export function useSequenceProgress(
  scroll: MotionValue<number>,
  enter = 0.16,
  finish = 0.72,
  spring: Spring = DEFAULT_SPRING,
) {
  const timeline = useTransform(scroll, [0, enter, finish, 1], [0, 0, 1, 1]);
  const progress = useSpring(timeline, spring);

  // A fast flick can leave the viewport before a spring catches up. Complete
  // the pose at the hold boundary so a departing scene is never half finished.
  useMotionValueEvent(scroll, "change", (value) => {
    if (value >= finish) progress.jump(1);
    if (value <= enter) progress.jump(0);
  });

  return progress;
}
