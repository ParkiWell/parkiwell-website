"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * A hairline read-out of how far through the page you are.
 *
 * Hidden by CSS rather than by returning `null`, so the markup is the same on
 * the server and on the client. See `useStillness` for why that matters.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 origin-left bg-brand motion-reduce:hidden"
    />
  );
}
