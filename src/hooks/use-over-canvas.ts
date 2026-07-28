"use client";

import { useEffect, useState } from "react";

const HEADER_MIDLINE = 34; // roughly the vertical centre of the header

/**
 * True while a full-bleed dark chapter is passing under the header, so the
 * header can invert instead of laying a light frosted bar over dark artwork.
 * Sections opt in with `data-canvas`.
 */
export function useOverCanvas() {
  const [over, setOver] = useState(false);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-canvas]"),
    );
    if (sections.length === 0) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      setOver(
        sections.some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= HEADER_MIDLINE && rect.bottom >= HEADER_MIDLINE;
        }),
      );
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return over;
}
