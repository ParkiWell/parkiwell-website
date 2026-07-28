"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { ArrowRight, Check, Offline } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { useStillness } from "@/hooks/use-stillness";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Every animated value below stays wired up whether or not the visitor asked
  // for stillness: it is the travel that flattens, not the markup. See
  // `useStillness` for what breaks when the markup changes instead.
  const still = useStillness();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const tiltY = useSpring(pointerY, { stiffness: 90, damping: 18 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [0, -70]);
  const visualY = useTransform(
    scrollYProgress,
    [0, 1],
    still ? [0, 0] : [0, -140],
  );
  const fade = useTransform(
    scrollYProgress,
    [0, 0.78],
    still ? [1, 1] : [1, 0.25],
  );

  function moveVisual(event: React.PointerEvent<HTMLDivElement>) {
    if (still) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -3);
    pointerY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 4);
  }

  return (
    <section
      ref={ref}
      data-chapter="hero"
      data-settle="1"
      className="chapter relative flex min-h-[100svh] overflow-hidden pt-28 sm:pt-32"
    >
      <Container className="relative flex flex-1 items-center pb-14 sm:pb-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 xl:gap-12">
          <motion.div
            style={{ y: copyY, opacity: fade }}
            className="relative z-10"
          >
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: still ? 0 : 0.75, ease }}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm font-extrabold text-ink shadow-card"
            >
              <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
              Made for life with Parkinson&rsquo;s
            </motion.p>

            <h1 className="display max-w-[9ch] text-[clamp(3.8rem,10vw,8.3rem)] text-ink">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: still ? 0 : 0.95, delay: still ? 0 : 0.05, ease }}
                >
                  Your day,
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.08em] text-brand">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: still ? 0 : 0.95, delay: still ? 0 : 0.13, ease }}
                >
                  in rhythm.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: still ? 0 : 0.6, delay: still ? 0 : 0.16, ease }}
              className="mt-7 max-w-[38rem] text-[1.1rem] font-medium leading-relaxed text-muted sm:text-[1.25rem]"
            >
              ParkiWell keeps the small care moments close. Daily records and
              medication routines share one clear home. Guided practice stays
              ready, even offline.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: still ? 0 : 0.6, delay: still ? 0 : 0.28, ease }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <a
                href="#get"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-ink px-7 font-extrabold text-bg transition-transform duration-200 hover:-translate-y-1"
              >
                Tell me when it launches
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#day"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/20 bg-surface px-7 font-extrabold text-ink transition-colors duration-300 hover:bg-brand-soft"
              >
                Take the tour
              </a>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: still ? 0 : 0.6, delay: still ? 0 : 0.4 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.92rem] font-bold text-muted"
            >
              <li className="flex items-center gap-2">
                <Offline className="h-5 w-5 text-accent" /> Works offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" /> No ads or tracking
              </li>
            </motion.ul>
          </motion.div>

          <motion.div
            style={{ y: visualY }}
            className="relative mx-auto h-[34rem] w-full max-w-[39rem] sm:h-[42rem] lg:h-[min(73vh,44rem)]"
            onPointerMove={moveVisual}
            onPointerLeave={() => {
              pointerX.set(0);
              pointerY.set(0);
            }}
          >
            <motion.div
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 900,
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: still ? 0 : 1.1, delay: still ? 0 : 0.2, ease }}
              className="absolute left-1/2 top-[2%] z-10 w-[17rem] -translate-x-1/2 sm:w-[19rem] lg:w-[min(21rem,34vh)]"
            >
              <PhoneFrame>
                <ThemedPhoneScreen
                  screen={screens.welcome}
                  alt="The ParkiWell welcome screen introducing daily care and guided recovery."
                  priority
                  sizes="(max-width: 639px) 272px, 336px"
                />
              </PhoneFrame>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
