"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useStillness } from "@/hooks/use-stillness";

/**
 * Enter-on-scroll wrapper. One shared rhythm across the whole site so the page
 * never feels like a collection of separately animated widgets.
 *
 * Reduced motion collapses the timing to nothing rather than dropping the
 * animation props, so the element still lands on its finished state instead of
 * being stranded wherever the first frame left it. See `useStillness`.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const still = useStillness();
  const Component = motion[as];

  return (
    <Component
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: still ? 0 : 0.85,
        delay: still ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}
