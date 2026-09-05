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
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { useStillness } from "@/hooks/use-stillness";
import { useSequenceProgress } from "@/hooks/use-sequence-progress";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const still = useStillness();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const tiltY = useSpring(pointerY, { stiffness: 90, damping: 24 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSequenceProgress(scrollYProgress);
  const copyY = useTransform(progress, [0, 0.65], [0, -90]);
  const copyFade = useTransform(progress, [0, 0.5], [1, 0]);
  const copyVisibility = useTransform(copyFade, (value) =>
    value < 0.01 ? "hidden" : "visible",
  );
  const sceneX = useTransform(progress, [0, 0.8], [0, -40]);
  const sceneShift = useTransform(sceneX, (value) => `${value}vw`);
  const rotateY = useTransform(progress, [0, 0.75, 1], [-18, 8, 0]);
  const rotateZ = useTransform(progress, [0, 0.8], [9, -4]);
  const rotateX = useTransform(progress, [0, 1], [8, 0]);
  const scale = useTransform(progress, [0, 0.8], [1, 0.88]);
  const orbitRotation = useTransform(progress, [0, 1], [-22, 68]);
  const orbitScale = useTransform(progress, [0, 1], [1, 0.76]);
  const endFade = useTransform(progress, [0.45, 0.8], [0, 1]);
  const endVisibility = useTransform(endFade, (value) =>
    value < 0.01 ? "hidden" : "visible",
  );

  const enter = (delay: number) => ({
    duration: still ? 0 : 1.1,
    delay: still ? 0 : delay,
    ease,
  });

  function moveVisual(event: React.PointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse" || progress.get() > 0.1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -8);
    pointerY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
  }

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
      <div
        data-settle="1"
        className="hero-end-settle pointer-events-none absolute inset-x-0 top-[54%] hidden h-[100svh] motion-safe:lg:block"
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
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={enter(0.18)}
                >
                  Daily care,
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.14em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={enter(0.3)}
                >
                  organized.
                </motion.span>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.45)}
              className="hero-description mt-7 max-w-[30rem] text-lg leading-relaxed text-muted"
            >
              ParkiWell combines symptom records, medication schedules, and
              guided speech and movement practice in one application.
            </motion.p>
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

          <motion.div
            style={{ x: sceneShift }}
            className="hero-scene"
            onPointerMove={moveVisual}
            onPointerLeave={() => {
              pointerX.set(0);
              pointerY.set(0);
            }}
          >
            <motion.div
              className="hero-orbit"
              style={{ rotate: orbitRotation, scale: orbitScale }}
            >
              <OrbitSculpture />
            </motion.div>
            <motion.div
              className="hero-device-entrance"
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.35)}
            >
              <motion.div
                className="hero-device-tilt"
                style={{ rotateX: tiltX, rotateY: tiltY }}
              >
                <motion.div
                  className="hero-device"
                  style={{ rotateY, rotateZ, rotateX, scale }}
                  data-hero-device
                >
                  <PhoneFrame>
                    <ThemedPhoneScreen
                      screen={screens.welcome}
                      alt="The ParkiWell welcome screen introducing daily care and guided recovery."
                      priority
                      sizes="(max-width: 639px) 240px, 340px"
                    />
                  </PhoneFrame>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity: endFade, visibility: endVisibility }}
            className="hero-end-copy"
          >
            <p className="label text-muted">Application overview</p>
            <p className="display mt-6 text-[clamp(3rem,5.2vw,5.8rem)]">
              Daily care.
              <br />
              One application.
            </p>
            <p className="mt-6 max-w-[23rem] text-lg text-muted">
              Review symptom records, manage medication schedules, and access
              guided practice and support resources.
            </p>
            <a
              href="#day"
              className="text-link mt-7 inline-flex min-h-12 items-center gap-3 text-sm font-bold"
            >
              View the features <ArrowRight className="h-4 w-4 rotate-90" />
            </a>
          </motion.div>
        </Container>
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
      </div>
    </section>
  );
}
