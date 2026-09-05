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

export function Closing() {
  const ref = useRef<HTMLElement>(null);
  const still = useStillness();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const turn = useTransform(
    scrollYProgress,
    [0, 1],
    still ? [0, 0] : [-22, -8],
  );
  const rise = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [70, 0]);

  return (
    <section
      ref={ref}
      id="get"
      data-chapter="get"
      data-settle="1"
      className="chapter closing-chapter relative overflow-hidden text-ink"
    >
      <Container className="relative">
        <div className="closing-layout">
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3 text-sm text-muted">
              <Mark className="h-6 w-6" />
              <span>Coming to iPhone and Android</span>
            </div>
            <h2 className="display max-w-[10ch] text-[clamp(3.5rem,7.3vw,7.5rem)]">
              Launch
              <br />
              updates.
            </h2>
            <p className="mt-7 max-w-[28rem] text-lg leading-relaxed text-muted">
              Register your email address to receive a notification when
              ParkiWell is available to download.
            </p>
            <LaunchList className="mt-9" />
            <p className="mt-5 flex items-center gap-2 text-xs text-muted">
              <Check className="h-3.5 w-3.5" /> One notification at launch.
            </p>
          </div>
          <div className="closing-scene">
            <div className="closing-orbit">
              <OrbitSculpture />
            </div>
            <motion.div
              style={{ rotateY: turn, rotateZ: -6, y: rise }}
              className="closing-device"
            >
              <PhoneFrame>
                <ThemedPhoneScreen
                  screen={screens.recovery}
                  alt="The ParkiWell Recovery screen with a weekly goal and guided chair workout."
                  sizes="(max-width: 639px) 208px, 304px"
                />
              </PhoneFrame>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
