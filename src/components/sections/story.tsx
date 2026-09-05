"use client";

import {
  cubicBezier,
  easeInOut,
  easeOut,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Hero } from "@/components/sections/hero";
import { Journey, steps } from "@/components/sections/journey";
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { screens } from "@/lib/screens";
import { stageHandover } from "@/lib/stages";
import { JOURNEY_ENTER, JOURNEY_FINISH } from "@/lib/story";
import { useSequenceProgress } from "@/hooks/use-sequence-progress";

/**
 * The phone's move, as fractions of the hero's whole scroll: from pinned at
 * the top to the moment the tour's panel reaches the top of the screen. It
 * starts once the copy is well on its way out and lands as the tour arrives,
 * so there is never a stretch of scroll where nothing is happening.
 */
const GLIDE = { from: 0.14, mid: 0.42, to: 0.7 } as const;

/** Slow in, slow out. The spring handles the wheel; this shapes the path. */
const glideEase = cubicBezier(0.6, 0, 0.3, 1);

/**
 * How a screen gives way to the next one. The incoming screen comes forward
 * out of a slight recess, fading in as it rises; the one beneath settles
 * back and darkens a little. No edge ever crosses the frame, which is what
 * made the earlier push read as a sheet rather than the app moving on.
 *
 * `reveal` runs over the whole handover, and the fade sits in the middle of
 * it: the screens are half and half at exactly the moment the copy beside the
 * phone is changing over and the rail moves on. The three read as one change.
 */
function useScreenPose(
  reveal: MotionValue<number>,
  covered: MotionValue<number>,
  lift: number,
) {
  const opacity = useTransform(reveal, [0.28, 0.72], [0, 1]);
  const y = useTransform(reveal, (value) => `${(1 - value) * lift}%`);
  const scale = useTransform(
    [reveal, covered],
    ([r, c]: number[]) => 0.965 + 0.035 * r - 0.04 * c,
  );
  const dim = useTransform(covered, [0, 1], [0, 0.16]);
  return { opacity, y, scale, dim };
}

function Shade({ amount }: { amount: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: amount }}
      className="absolute inset-0 z-3 bg-[#12363a]"
    />
  );
}

/** The welcome screen: under everything, and covered as the tour arrives. */
function WelcomeScreen({ arrival }: { arrival: MotionValue<number> }) {
  const shown = useTransform(() => 1);
  const { scale, dim } = useScreenPose(shown, arrival, 0);

  return (
    <motion.div style={{ scale }} className="relative">
      <ThemedPhoneScreen
        screen={screens.welcome}
        alt="The ParkiWell welcome screen introducing daily care and guided recovery."
        priority
        sizes="384px"
      />
      <Shade amount={dim} />
    </motion.div>
  );
}

/**
 * One stop of the tour, laid over the stop before it. The first rides the
 * tour's arrival rather than a step boundary, so it lands as the tour's copy
 * does and the phone and the page change together; it also comes a little
 * further forward, because it is the moment the app opens.
 */
function AppScreen({
  index,
  journey,
  arrival,
}: {
  index: number;
  journey: MotionValue<number>;
  arrival: MotionValue<number>;
}) {
  const step = steps[index];
  const reveal = useTransform([arrival, journey], ([a, j]: number[]) =>
    index === 0 ? a : stageHandover(j, index, steps.length),
  );
  const covered = useTransform(journey, (value) =>
    index + 1 < steps.length
      ? stageHandover(value, index + 1, steps.length)
      : 0,
  );
  const { opacity, y, scale, dim } = useScreenPose(
    reveal,
    covered,
    index === 0 ? 9 : 5,
  );

  return (
    <motion.div style={{ opacity, y, scale }} className="absolute inset-0">
      <ThemedPhoneScreen screen={step.screen} alt={step.alt} sizes="384px" />
      <Shade amount={dim} />
    </motion.div>
  );
}

/**
 * The one phone the hero and the tour share.
 *
 * It opens tilted on the right, where the hero's copy leaves room for it. As
 * that copy leaves, it crosses to the middle of the screen in a single slow
 * gesture: it draws back a little as it travels, lifts through the middle of
 * the path, and turns to face you with a few degrees of overshoot before it
 * settles. The tour then happens inside it. Copy on the left and the rail on
 * the right change around the phone, and the screens change within it, but
 * the phone itself stays where it lands. Nothing on this page swaps sides.
 */
function StoryDevice({
  glide,
  journey,
  arrival,
  tiltX,
  tiltY,
}: {
  glide: MotionValue<number>;
  journey: MotionValue<number>;
  arrival: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  const path = [GLIDE.from, GLIDE.mid, GLIDE.to];
  const x = useTransform(glide, [GLIDE.from, GLIDE.to], ["24vw", "0vw"], {
    ease: glideEase,
  });
  const y = useTransform(glide, path, ["1.5rem", "-0.5rem", "3.5rem"], {
    ease: [easeInOut, easeInOut],
  });
  const turn = useTransform(glide, path, [-18, 5, 0], {
    ease: [easeInOut, easeOut],
  });
  const rotateY = useTransform(
    [turn, journey],
    ([t, j]: number[]) => t - 4 * j,
  );
  const rotateZ = useTransform(glide, path, [9, -1.5, 0], {
    ease: [easeInOut, easeOut],
  });
  const rotateX = useTransform(glide, [GLIDE.from, GLIDE.to], [8, 0], {
    ease: glideEase,
  });
  const scale = useTransform(glide, path, [0.94, 0.9, 1], {
    ease: [easeInOut, easeInOut],
  });
  const orbitRotate = useTransform(
    [glide, journey],
    ([g, j]: number[]) => -22 + 80 * g + 110 * j,
  );
  const orbitScale = useTransform(glide, [GLIDE.from, GLIDE.to], [1, 0.82], {
    ease: glideEase,
  });
  return (
    <div className="story-device-track">
      <div className="story-device">
        <div className="story-device__stage">
          <motion.div
            className="story-device__orbit"
            style={{ x, rotate: orbitRotate, scale: orbitScale }}
          >
            <OrbitSculpture />
          </motion.div>
          <motion.div
            className="story-device__phone"
            style={{ x, y, rotateX, rotateY, rotateZ, scale }}
          >
            <motion.div
              className="story-device__tilt"
              style={{ rotateX: tiltX, rotateY: tiltY }}
            >
              <PhoneFrame>
                <div className="relative">
                  <WelcomeScreen arrival={arrival} />
                  {steps.map((step, index) => (
                    <AppScreen
                      key={step.label}
                      index={index}
                      journey={journey}
                      arrival={arrival}
                    />
                  ))}
                </div>
              </PhoneFrame>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * The hero and the feature tour, told with one phone.
 *
 * Each chapter is still its own pinned panel, so this owns the scroll for
 * both and hands the progress down: the device layer needs it to place the
 * phone, and the tour needs its own to place its copy. The layout choice
 * (this layer against the phones inside each chapter) is made in CSS, so the
 * first client render matches the server. See `useStillness`.
 *
 * The device layer sits in a track that is absolutely positioned over the
 * whole story, rather than pulled over its siblings with a negative margin.
 * Sticky positioning keeps an element's margin box inside its container, and
 * a negative bottom margin empties that box, so the layer stayed pinned a
 * full screen past the tour and hung over the privacy chapter.
 */
export function Story() {
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const tiltY = useSpring(pointerY, { stiffness: 90, damping: 24 });

  // The whole of the hero, pin and release alike: 0 with the hero pinned at
  // the top, 1 when its foot reaches the top of the screen, which is the
  // moment the tour's panel has fully arrived. The phone's move spans both.
  const heroScroll = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const glide = useSequenceProgress(heroScroll.scrollYProgress, 0.02, 0.98, {
    stiffness: 120,
    damping: 30,
  });

  const journeyScroll = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });
  const journey = useSequenceProgress(
    journeyScroll.scrollYProgress,
    JOURNEY_ENTER,
    JOURNEY_FINISH,
  );

  // 0 as the tour's panel appears at the foot of the screen, 1 once it has
  // slid all the way up under the phone: the release between the two pins.
  // The raw value places the tour's copy exactly against the scroll; the
  // sprung one times the screen push and the fade.
  const arrivalScroll = useScroll({
    target: journeyRef,
    offset: ["start end", "start start"],
  });
  const arrival = useSequenceProgress(
    arrivalScroll.scrollYProgress,
    0.3,
    0.85,
    { stiffness: 120, damping: 30 },
  );

  function moveVisual(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || glide.get() > 0.08) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -8);
    pointerY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
  }

  function resetVisual() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div className="story relative">
      <StoryDevice
        glide={glide}
        journey={journey}
        arrival={arrival}
        tiltX={tiltX}
        tiltY={tiltY}
      />
      <Hero
        ref={heroRef}
        progress={glide}
        onPointerMove={moveVisual}
        onPointerLeave={resetVisual}
      />
      <Journey
        pinnedRef={journeyRef}
        progress={journey}
        arrivalRaw={arrivalScroll.scrollYProgress}
        arrival={arrival}
      />
    </div>
  );
}
