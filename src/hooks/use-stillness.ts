"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const read = () => window.matchMedia(QUERY).matches;

/**
 * True when the visitor has asked for reduced motion, but not until after
 * hydration.
 *
 * The delay is the point, and it is why this exists instead of motion's own
 * `useReducedMotion`. That hook reads the media query during the first client
 * render, and the server had no way to know the answer, so any markup that
 * branches on it differs between the two. React treats that as a failed
 * hydration, throws the tree away, and rebuilds it from the JSX. On the way
 * through it reconciles the `<html>` element too, which wipes the `data-theme`
 * attribute the theme script set before first paint: every visitor who asked
 * for reduced motion lost dark mode, and got a console error with it.
 *
 * `useSyncExternalStore` hydrates on the server's answer and switches to the
 * real one immediately afterwards, which is the supported way to render
 * something the server cannot know. Callers have to make sure that first render
 * is the moving one, and that settling afterwards lands on a finished state
 * rather than stranding an animation part way through: pass a zero duration
 * rather than dropping the animation props.
 */
export function useStillness() {
  return useSyncExternalStore(subscribe, read, () => false);
}
