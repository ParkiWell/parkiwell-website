"use client";

import {
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

/** Reserve scroll distance for an opening and a finished frame before release. */
export function useSequenceProgress(
  scroll: MotionValue<number>,
  enter = 0.16,
  finish = 0.72,
) {
  const timeline = useTransform(scroll, [0, enter, finish, 1], [0, 0, 1, 1]);
  const progress = useSpring(timeline, { stiffness: 180, damping: 32 });

  // A fast flick can leave the viewport before a spring catches up. Complete
  // the pose at the hold boundary so a departing scene is never half finished.
  useMotionValueEvent(scroll, "change", (value) => {
    if (value >= finish) progress.jump(1);
    if (value <= enter) progress.jump(0);
  });

  return progress;
}
