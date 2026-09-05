"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Check, Mark } from "@/components/icons";
import { LaunchList } from "@/components/launch-list";
import { Container } from "@/components/ui/container";
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { useStillness } from "@/hooks/use-stillness";
import { useSequenceProgress } from "@/hooks/use-sequence-progress";

/**
 * The closing invitation.
 *
 * One screen: the copy in the middle and the app rising to meet it, three
 * screens that come up out of the bottom edge as the chapter arrives, the
 * outer two spreading from behind the first. The chapter is one viewport
 * tall at rest and settles with its top at the top of the screen, so the
 * first line clears the header and the phones' edge is the bottom of the
 * screen. Reduced motion flattens the travel to nothing, so they are simply
 * already there.
 */
export function Closing() {
  const ref = useRef<HTMLElement>(null);
  const still = useStillness();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const progress = useSequenceProgress(scrollYProgress, 0.15, 0.85, {
    stiffness: 90,
    damping: 26,
  });
  const spread = useTransform(progress, (value) => (still ? 1 : value));
  const rise = useTransform(spread, [0, 1], [110, 0]);
  const sideRise = useTransform(spread, [0, 1], [150, 0]);
  const leftX = useTransform(spread, [0, 1], ["0%", "-74%"]);
  const rightX = useTransform(spread, [0, 1], ["0%", "74%"]);
  const leftTurn = useTransform(spread, [0, 1], [0, -9]);
  const rightTurn = useTransform(spread, [0, 1], [0, 9]);

  return (
    <section
      ref={ref}
      id="get"
      data-chapter="get"
      className="chapter closing-chapter relative overflow-hidden text-ink"
    >
      {/* Rest with the top of the chapter at the top of the screen, not its
          middle: the first line has to clear the header. */}
      <div
        data-settle="1"
        className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]"
        aria-hidden="true"
      />
      <Container className="relative z-10">
        <div className="mx-auto max-w-[46rem] text-center">
          <p className="mb-6 inline-flex items-center gap-3 text-sm text-muted">
            <Mark className="h-6 w-6" />
            <span>Coming to iPhone and Android</span>
          </p>
          <h2 className="display text-[clamp(3rem,6vw,6rem)]">
            Launch updates.
          </h2>
          <p className="mx-auto mt-6 max-w-[28rem] text-lg leading-relaxed text-muted">
            Register your email address to receive a notification when ParkiWell
            is available to download.
          </p>
          <LaunchList className="mt-7 flex flex-col items-center" />
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <Check className="h-3.5 w-3.5" /> One notification at launch.
          </p>
        </div>
      </Container>

      <div className="closing-fan">
        <div className="closing-orbit" aria-hidden="true">
          <OrbitSculpture />
        </div>
        <motion.div
          style={{ x: leftX, y: sideRise, rotateZ: leftTurn }}
          className="closing-phone closing-phone--left"
        >
          <PhoneFrame>
            <ThemedPhoneScreen
              screen={screens.manage}
              alt="The ParkiWell Manage screen with medications due today."
              sizes="(max-width: 639px) 128px, 248px"
            />
          </PhoneFrame>
        </motion.div>
        <motion.div
          style={{ y: rise }}
          className="closing-phone closing-phone--centre"
        >
          <PhoneFrame>
            <ThemedPhoneScreen
              screen={screens.home}
              alt="The ParkiWell Home screen with today's symptoms and medications."
              sizes="(max-width: 639px) 152px, 288px"
            />
          </PhoneFrame>
        </motion.div>
        <motion.div
          style={{ x: rightX, y: sideRise, rotateZ: rightTurn }}
          className="closing-phone closing-phone--right"
        >
          <PhoneFrame>
            <ThemedPhoneScreen
              screen={screens.community}
              alt="The ParkiWell Community screen with research, videos, and support links."
              sizes="(max-width: 639px) 128px, 248px"
            />
          </PhoneFrame>
        </motion.div>
      </div>
    </section>
  );
}
