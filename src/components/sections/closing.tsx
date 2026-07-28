"use client";

import { motion } from "motion/react";
import { Mark } from "@/components/icons";
import { LaunchList } from "@/components/launch-list";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { useStillness } from "@/hooks/use-stillness";

export function Closing() {
  const still = useStillness();

  return (
    <section
      id="get"
      data-chapter="get"
      data-snap
      className="chapter relative flex min-h-[100svh] items-center overflow-hidden py-28 text-ink"
    >
      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: still ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label flex items-center gap-3 text-ink/60">
              <Mark className="h-5 w-5" /> One more thing
            </p>
            <h2 className="display mt-7 max-w-[8ch] text-[clamp(4rem,9vw,8.5rem)]">
              Keep your day close.
            </h2>
            <p className="mt-8 max-w-[36rem] text-[1.12rem] font-semibold leading-relaxed text-ink/75 sm:text-[1.25rem]">
              ParkiWell is coming to iPhone and Android. Send a note and we will
              let you know when it lands. Nothing else, and no one else sees the
              address.
            </p>
            <LaunchList className="mt-10" />
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-extrabold">
              <span className="rounded-full border border-ink/20 px-4 py-2">
                Coming to iPhone
              </span>
              <span className="rounded-full border border-ink/20 px-4 py-2">
                Coming to Android
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 52, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: still ? 0 : 0.9,
              delay: still ? 0 : 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mx-auto w-[min(19rem,72vw)] sm:w-[22rem] lg:w-[min(23rem,45vh)]"
          >
            <PhoneFrame className="relative">
              <ThemedPhoneScreen
                lightSrc="/screens/recovery.webp"
                darkSrc="/screens/recovery-dark.webp"
                alt="The ParkiWell Recovery screen with a weekly goal and guided chair workout."
                sizes="(max-width: 639px) 72vw, 368px"
              />
            </PhoneFrame>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
