"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { RefObject } from "react";
import { ArrowRight, Check, Offline } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { useStillness } from "@/hooks/use-stillness";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The opening chapter. On a large screen the phone beside the copy belongs to
 * the story layer above this section, which carries it on into the tour; the
 * phone drawn here is for small screens and reduced motion, where each
 * chapter keeps its own. Which one shows is decided in CSS.
 */
export function Hero({
  ref,
  progress,
  onPointerMove,
  onPointerLeave,
}: {
  ref: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
}) {
  const still = useStillness();
  // `progress` runs over the whole hero, release included (see `Story`). The
  // copy leaves during the first quarter, ahead of the phone's move, and the
  // foot of the panel fades just before the panel itself starts to travel,
  // so nothing is seen scrolling off during the handover.
  const copyY = useTransform(progress, [0.04, 0.34], [0, -80]);
  const copyFade = useTransform(progress, [0.04, 0.27], [1, 0]);
  const copyVisibility = useTransform(copyFade, (value) =>
    value < 0.01 ? "hidden" : "visible",
  );
  const footFade = useTransform(progress, [0.4, 0.52], [1, 0]);

  const enter = (delay: number) => ({
    duration: still ? 0 : 1.1,
    delay: still ? 0 : delay,
    ease,
  });

  return (
    <section
      ref={ref}
      data-chapter="hero"
      className="chapter hero-chapter relative"
    >
      <div
        data-settle="1"
        className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]"
        aria-hidden="true"
      />
      <div className="hero-viewport">
        <Container className="hero-layout relative">
          <motion.div
            style={{ y: copyY, opacity: copyFade, visibility: copyVisibility }}
            className="hero-copy relative z-10"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.1)}
              className="label mb-8 flex items-center gap-3 text-muted"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-current"
                aria-hidden="true"
              />
              Parkinson&rsquo;s care management
            </motion.p>
            <h1 className="hero-title display">
              <span className="block pb-[0.12em]">Parkinson&rsquo;s</span>
              <span className="block pb-[0.14em]">care, organized.</span>
            </h1>
            <p className="hero-description mt-7 max-w-[30rem] text-lg leading-relaxed text-muted">
              Track symptoms, organize medication reminders, and plan guided
              speech and movement practice with ParkiWell, a Parkinson&rsquo;s
              care app for iPhone and Android.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.55)}
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
            >
              <a href="#get" className="premium-button group">
                Get notified at launch{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#day"
                className="text-link inline-flex min-h-12 items-center gap-2 text-sm font-bold"
              >
                Explore the app <ArrowRight className="h-4 w-4 rotate-45" />
              </a>
            </motion.div>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={enter(0.7)}
              className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-muted"
            >
              <li className="flex items-center gap-2">
                <Offline className="h-4 w-4" /> Works offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> No ads or tracking
              </li>
            </motion.ul>
          </motion.div>

          <div
            className="hero-scene"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
          >
            <div className="hero-orbit">
              <OrbitSculpture />
            </div>
            <motion.div
              className="hero-inline-device"
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.35)}
            >
              <div className="hero-device">
                <PhoneFrame>
                  <ThemedPhoneScreen
                    screen={screens.welcome}
                    alt="The ParkiWell welcome screen introducing daily care and guided recovery."
                    priority
                    sizes="(max-width: 639px) 192px, (max-width: 1023px) 240px, 384px"
                  />
                </PhoneFrame>
              </div>
            </motion.div>
          </div>
        </Container>
        <motion.div style={{ opacity: footFade }} className="hero-bottom-fade">
          <Container className="hero-bottom">
            <span className="label flex items-center gap-3">
              <span className="scroll-cue" aria-hidden="true">
                <ArrowRight className="h-3 w-3 rotate-90" />
              </span>{" "}
              Scroll to explore the features
            </span>
            <span className="label hidden sm:block">
              ParkiWell / Daily care management
            </span>
          </Container>
        </motion.div>
      </div>
    </section>
  );
}
