"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check, Mark } from "@/components/icons";
import { LaunchList } from "@/components/launch-list";
import { Container } from "@/components/ui/container";
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { useStillness } from "@/hooks/use-stillness";

/**
 * The closing invitation.
 *
 * One screen: the copy in the middle and the app rising to meet it, three
 * screens that come up out of the bottom edge as the chapter arrives, the
 * outer two spreading from behind the first. The chapter is one viewport
 * tall at rest and settles with its top at the top of the screen, so the
 * first line clears the header and the phones' edge is the bottom of the
 * screen. The entrance runs once on a clock, so pausing or reversing a scroll
 * cannot jerk the phones backwards. Reduced motion lands on the finished pose.
 */
export function Closing() {
  const fan = useRef<HTMLDivElement>(null);
  const still = useStillness();
  // Observe the phone area, not the chapter's copy: an earlier trigger let
  // the whole entrance finish below the viewport before anyone could see it.
  const entered = useInView(fan, { once: true, amount: 0.38 });
  const entrance = (delay: number) => ({
    duration: still ? 0 : 1.1,
    delay: still ? 0 : delay,
    ease: [0.22, 0.68, 0, 1] as const,
  });

  return (
    <section
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

      <div ref={fan} className="closing-fan">
        <div className="closing-orbit" aria-hidden="true">
          <OrbitSculpture />
        </div>
        <motion.div
          initial={{ x: "-44%", y: 120, rotateZ: -3 }}
          animate={
            entered
              ? { x: "-74%", y: 0, rotateZ: -9 }
              : { x: "-44%", y: 120, rotateZ: -3 }
          }
          transition={entrance(0.08)}
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
          initial={{ y: 96 }}
          animate={{ y: entered ? 0 : 96 }}
          transition={entrance(0)}
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
          initial={{ x: "44%", y: 120, rotateZ: 3 }}
          animate={
            entered
              ? { x: "74%", y: 0, rotateZ: 9 }
              : { x: "44%", y: 120, rotateZ: 3 }
          }
          transition={entrance(0.12)}
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
