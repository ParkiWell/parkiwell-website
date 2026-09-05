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
 * Deliberately short of overlapping: stopping in the middle of a boundary
 * leaves you exactly where you stopped. The pull is for when you were clearly
 * headed somewhere, not a claim on every pixel of the page, and the furthest
 * it can carry you unprompted stays under half a screen.
 */
const REACH = 0.28;

/** Quiet time after the last input before the page is allowed to settle. */
const REST_MS = 240;

/** Spring for the settle. Heavy, slow, and just underdamped enough to give. */
const STIFFNESS = 70;
const DAMPING = 15;
const MASS = 1.3;

type Target = { centre: number; weight: number };

function readTargets(): Target[] {
  const viewport = window.innerHeight;
  const furthest = document.documentElement.scrollHeight - viewport;
  const seen = new Map<number, Target>();

  for (const element of document.querySelectorAll<HTMLElement>(
    "[data-settle]",
  )) {
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
    if (!existing || weight > existing.weight)
      seen.set(centre, { centre, weight });
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

    const heldPointers = new Set<number>();
    const heldKeys = new Set<string>();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settling = false;
    let velocity = 0;
    let position = 0;
    let goal = 0;
    let last = 0;
    let writtenAt = 0;

    const stop = () => {
      settling = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const step = (now: number) => {
      frame = 0;
      if (!settling) return;
      // Anchor navigation and history restoration can move the page without
      // a wheel event. Never pull them back to an earlier spring destination.
      if (Math.abs(window.scrollY - writtenAt) > ARRIVED) {
        stop();
        return;
      }

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
      writtenAt = window.scrollY;
      frame = requestAnimationFrame(step);
    };

    const settle = () => {
      // Reading, editing, selecting and an open menu all outrank the pull.
      if (
        heldPointers.size ||
        heldKeys.size ||
        document.documentElement.dataset.scrollLocked === "true" ||
        document.activeElement?.closest(
          "input, textarea, select, [contenteditable='true']",
        ) ||
        window.getSelection()?.isCollapsed === false
      )
        return;
      const at = window.scrollY;
      // Read at rest, not at mount. FAQ panels, navigation and font loading can
      // move every later target. This never measures layout during a frame.
      const target = nearest(readTargets(), at, window.innerHeight);
      if (!target || Math.abs(target.centre - at) < ARRIVED) return;

      position = at;
      writtenAt = at;
      goal = target.centre;
      velocity = 0;
      settling = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const onScroll = () => {
      if (settling || heldPointers.size || heldKeys.size) return;
      clearTimeout(timer);
      timer = setTimeout(settle, REST_MS);
    };

    // Anything the visitor does outranks the settle, immediately.
    const interrupt = () => {
      clearTimeout(timer);
      stop();
    };

    const pointerDown = (event: PointerEvent) => {
      heldPointers.add(event.pointerId);
      interrupt();
    };
    const pointerUp = (event: PointerEvent) =>
      heldPointers.delete(event.pointerId);
    const keyDown = (event: KeyboardEvent) => {
      heldKeys.add(event.code);
      interrupt();
    };
    const keyUp = (event: KeyboardEvent) => heldKeys.delete(event.code);
    const resetInput = () => {
      heldPointers.clear();
      heldKeys.clear();
      interrupt();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    for (const event of ["wheel", "touchstart", "touchmove", "focusin"]) {
      window.addEventListener(event, interrupt, { passive: true });
    }
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", pointerUp, { passive: true });
    window.addEventListener("pointercancel", pointerUp, { passive: true });
    window.addEventListener("keydown", keyDown, { passive: true });
    window.addEventListener("keyup", keyUp, { passive: true });
    window.addEventListener("blur", resetInput);
    window.addEventListener("resize", interrupt, { passive: true });
    document.addEventListener("visibilitychange", resetInput);

    return () => {
      clearTimeout(timer);
      stop();
      window.removeEventListener("scroll", onScroll);
      for (const event of ["wheel", "touchstart", "touchmove", "focusin"]) {
        window.removeEventListener(event, interrupt);
      }
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", resetInput);
      window.removeEventListener("resize", interrupt);
      document.removeEventListener("visibilitychange", resetInput);
    };
  }, [still]);
}
