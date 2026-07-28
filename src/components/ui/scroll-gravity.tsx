"use client";

import { useMagneticScroll } from "@/hooks/use-magnetic-scroll";

/** Mounts the page's scroll gravity. Renders nothing. */
export function ScrollGravity() {
  useMagneticScroll();
  return null;
}
