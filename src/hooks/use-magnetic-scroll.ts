"use client";

import { useEffect } from "react";
import { useStillness } from "@/hooks/use-stillness";

/**
 * Gravity, not snapping.
 *
 * CSS scroll snapping was too sharp for this page: it waits until you stop and
 * then yanks, which reads as the page correcting you. This does the opposite.
 * While you are scrolling nothing is taken away from you. When you let go, the
 * page drifts the rest of the way onto the nearest chapter on a spring, so it
 * arrives with a little give rather than a click.
 *
 * Two things give the scroll weight:
 *
 *  - a pull that grows as you approach a chapter's centre, so the last stretch
 *    into one costs less effort and the first stretch out of one costs more.
 *    That is the "slightly harder to get past" feeling, and it is produced by
 *    where the page comes to rest, never by fighting the wheel;
 *  - a settle that overshoots very slightly before coming back, which is what
 *    makes something with mass feel like it has mass.
 *
 * Everything here yields immediately to the visitor. Any wheel, touch, key, or
 * pointer input during a settle cancels it outright, and it never runs at all
 * under `prefers-reduced-motion`.
 */

/** Anything closer than this to a centre is treated as already arrived. */
const ARRIVED = 2;

/**
 * How far from a chapter's centre the pull reaches, as a share of the viewport.
 *
 * Wide enough that the reaches overlap, so wherever you stop there is always a
 * chapter wanting to pull you square. A shorter reach left a band in the middle
 * of every boundary where nothing pulled at all, and stopping there felt like
 * the page had given up on you rather than left you alone.
 */
const REACH = 0.62;

/** Quiet time after the last input before the page is allowed to settle. */
const REST_MS = 90;

/** Spring for the settle. Heavy, and just underdamped enough to give. */
const STIFFNESS = 110;
const DAMPING = 19;
const MASS = 1.25;

type Target = { centre: number; weight: number };

function readTargets(): Target[] {
  const viewport = window.innerHeight;
  const furthest = document.documentElement.scrollHeight - viewport;
  const seen = new Map<number, Target>();

  for (const element of document.querySelectorAll<HTMLElement>("[data-settle]")) {
    const box = element.getBoundingClientRect();
    if (box.height === 0) continue; // hidden at this breakpoint

    const top = box.top + window.scrollY;
    // Put the middle of the chapter in the middle of the screen. For anything
    // at least a screen tall that is the same as aligning its top, but it is
    // what keeps a short chapter, and the end of the page, centred rather than
    // jammed against an edge.
    const centre = Math.round(
      Math.min(furthest, Math.max(0, top + box.height / 2 - viewport / 2)),
    );
    const weight = Number(element.dataset.settle) || 1;
    const existing = seen.get(centre);
    if (!existing || weight > existing.weight) seen.set(centre, { centre, weight });
  }

  // The bottom of the page is a place to stop, whether or not a chapter
  // centres there. Without this the last chapter's pull wins at the end of the
  // scroll and quietly drags the footer back off the screen, so the one thing
  // you cannot reach is the end.
  if (furthest > 0 && !seen.has(furthest)) {
    seen.set(furthest, { centre: furthest, weight: 1 });
  }

  return [...seen.values()].sort((a, b) => a.centre - b.centre);
}

function nearest(targets: Target[], at: number, viewport: number) {
  let best: Target | null = null;
  let bestDistance = Infinity;

  for (const target of targets) {
    const distance = Math.abs(target.centre - at);
    // A heavier target reaches further, which is how the day steps hold on a
    // little harder than the chapters either side of them.
    if (distance > viewport * REACH * target.weight) continue;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = target;
    }
  }

  return best;
}

export function useMagneticScroll() {
  const still = useStillness();

  useEffect(() => {
    if (still) return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // touch has its own physics

    let targets = readTargets();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settling = false;
    let velocity = 0;
    let position = 0;
    let goal = 0;
    let last = 0;

    const stop = () => {
      settling = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const step = (now: number) => {
      frame = 0;
      if (!settling) return;

      // Fixed sub-steps: a spring integrated on a variable frame time behaves
      // differently on a 60Hz and a 120Hz screen, and this one is tuned by feel.
      const elapsed = Math.min(64, now - last);
      last = now;
      for (let done = 0; done < elapsed; done += 4) {
        const dt = Math.min(4, elapsed - done) / 1000;
        const acceleration =
          (-STIFFNESS * (position - goal) - DAMPING * velocity) / MASS;
        velocity += acceleration * dt;
        position += velocity * dt;
      }

      if (Math.abs(position - goal) < 0.5 && Math.abs(velocity) < 8) {
        window.scrollTo({ top: goal, behavior: "instant" });
        stop();
        return;
      }

      window.scrollTo({ top: position, behavior: "instant" });
      frame = requestAnimationFrame(step);
    };

    const settle = () => {
      const at = window.scrollY;
      const target = nearest(targets, at, window.innerHeight);
      if (!target || Math.abs(target.centre - at) < ARRIVED) return;

      position = at;
      goal = target.centre;
      velocity = 0;
      settling = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const onScroll = () => {
      if (settling) return; // our own scrolling, not theirs
      clearTimeout(timer);
      timer = setTimeout(settle, REST_MS);
    };

    // Anything the visitor does outranks the settle, immediately.
    const interrupt = () => {
      clearTimeout(timer);
      stop();
    };

    const remeasure = () => {
      interrupt();
      targets = readTargets();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) {
      window.addEventListener(event, interrupt, { passive: true });
    }
    window.addEventListener("resize", remeasure, { passive: true });

    // Chapter heights are in svh and images settle late, so measure again once
    // the page has stopped moving under its own weight.
    const settleIn = setTimeout(remeasure, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(settleIn);
      stop();
      window.removeEventListener("scroll", onScroll);
      for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) {
        window.removeEventListener(event, interrupt);
      }
      window.removeEventListener("resize", remeasure);
    };
  }, [still]);
}
