"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Heart, Person, Pill, Play } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { Reveal } from "@/components/ui/reveal";
import { stageIndex, stageOffset, stagePresence } from "@/lib/stages";
import { dayTrack } from "@/lib/tones";

type Step = {
  label: string;
  title: string;
  body: string;
  lightSrc: string;
  darkSrc: string;
  alt: string;
  icon: typeof Heart;
};

const steps: Step[] = [
  {
    label: "A quick check-in",
    title: "Notice how today feels",
    body: "See symptom and medication activity together, then add a note when you want to remember more context.",
    lightSrc: "/screens/home.webp",
    darkSrc: "/screens/home-dark-v2.webp",
    alt: "The Home screen showing symptom activity, medication activity, and a personal pattern summary.",
    icon: Heart,
  },
  {
    label: "Medication time",
    title: "Keep the next dose close",
    body: "Schedules and doses live beside everything due today, with reminders ready when you choose to set them.",
    lightSrc: "/screens/manage.webp",
    darkSrc: "/screens/manage-dark-v2.webp",
    alt: "The Manage screen showing medications due today and medication tools.",
    icon: Pill,
  },
  {
    label: "A practice moment",
    title: "Move to a plan you set",
    body: "Choose weekly speech and movement goals. ParkiWell brings one focused session forward and keeps your history together.",
    lightSrc: "/screens/recovery.webp",
    darkSrc: "/screens/recovery-dark-v2.webp",
    alt: "The Recovery screen showing a weekly practice goal and a chair workout ready to begin.",
    icon: Play,
  },
  {
    label: "Helpful resources",
    title: "Keep support within reach",
    body: "The Community area gathers research, educational videos, specialist links, events, helplines, and daily living guides in one place.",
    lightSrc: "/screens/community.webp",
    darkSrc: "/screens/community-dark-v2.webp",
    alt: "The Community screen showing research, videos, specialist links, events, helplines, and daily living guides.",
    icon: Person,
  },
];

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readDarkTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark";

function StepCopy({
  item,
  index,
  progress,
}: {
  item: Step;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (value) =>
    stagePresence(value, index, steps.length),
  );
  const y = useTransform(progress, (value) =>
    stageOffset(value, index, steps.length, 22),
  );

  return (
    <motion.article
      style={{ opacity, y }}
      className="col-start-1 row-start-1 self-center"
    >
      <p className="label text-ink/70">{item.label}</p>
      <h3 className="display mt-4 max-w-[9ch] text-[clamp(3.3rem,6.3vw,6.2rem)] text-ink">
        {item.title}
      </h3>
      <p className="mt-7 max-w-[35rem] text-[1.08rem] font-semibold leading-relaxed text-ink/75 xl:text-[1.22rem]">
        {item.body}
      </p>
    </motion.article>
  );
}

function StepVisual({
  item,
  index,
  progress,
}: {
  item: Step;
  index: number;
  progress: MotionValue<number>;
}) {
  const presence = useTransform(progress, (value) =>
    stagePresence(value, index, steps.length),
  );
  const y = useTransform(progress, (value) =>
    stageOffset(value, index, steps.length, 24),
  );
  const scale = useTransform(presence, [0, 1], [0.975, 1]);
  return (
    <motion.div
      style={{ opacity: presence, y, scale }}
      className="absolute inset-0 overflow-hidden"
    >
      <ThemedPhoneScreen
        lightSrc={item.lightSrc}
        darkSrc={item.darkSrc}
        alt={item.alt}
        sizes="336px"
      />
    </motion.div>
  );
}

/**
 * The non-pinned fallback. Each card owns one step of the tone scale and fades
 * into the next over its own height, so the four of them read as one long
 * gradient rather than four coloured blocks. That is pure CSS, which means it
 * behaves the same with reduced motion and before hydration.
 */
function StackedStep({ item, index }: { item: Step; index: number }) {
  const Icon = item.icon;

  return (
    <article
      data-chapter={`day-${index + 1}`}
      data-snap
      className="chapter-flow flex min-h-[100svh] items-center text-ink"
    >
      <Container className="py-24">
        <Reveal>
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
            <div className="order-2 mx-auto w-[min(11rem,46vw)] md:w-[15rem]">
              <PhoneFrame>
                <ThemedPhoneScreen
                  lightSrc={item.lightSrc}
                  darkSrc={item.darkSrc}
                  alt={item.alt}
                  sizes="(max-width: 767px) 46vw, 240px"
                />
              </PhoneFrame>
            </div>
            <div className="order-1">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink/25 bg-[#fffaf0] dark:bg-[#10292d]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="label">{item.label}</p>
              </div>
              <p className="numeral mt-8 text-sm opacity-60">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(steps.length).padStart(2, "0")}
              </p>
              <h3 className="display mt-4 max-w-[9ch] text-[clamp(3rem,13vw,5rem)]">
                {item.title}
              </h3>
              <p className="mt-6 max-w-[34rem] text-[1.08rem] font-semibold leading-relaxed opacity-75">
                {item.body}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </article>
  );
}

// The pinned panel is one flat colour at any moment, so it has to walk the same
// stretch of the tone scale the stacked cards blend through: it enters on the
// tone the hero fades into and leaves on the tone the privacy chapter opens on.
const trackStops = dayTrack(false).map(
  (_, index, all) => index / (all.length - 1),
);

/**
 * How far you scroll to move the day on by one step, and the run-out at the
 * end that lets the last step hold before the privacy chapter takes over.
 *
 * A step is deliberately longer than a screen. The sequence is four screens of
 * reading compressed into one pinned panel, and matching it one to one made
 * the whole chapter go by in a flick.
 */
const STEP_SVH = 125;
const RUN_OUT_SVH = 30;
const TRACK_SVH = steps.length * STEP_SVH + RUN_OUT_SVH;

/**
 * Where each step is settled, as a fraction of the panel's scroll travel.
 *
 * `stagePresence` gives step k the slice of progress from k/n to (k+1)/n, so
 * the middle of that slice is where its copy is fully opaque and nothing is
 * handing over. That is the position both the snap points and the step buttons
 * aim at, so clicking a step and scrolling to it come to rest in one place.
 */
const settledAt = (index: number) => (index + 0.5) / steps.length;

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const dark = useSyncExternalStore(
    subscribeToTheme,
    readDarkTheme,
    () => false,
  );
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Heavy and overdamped. The panel follows the scroll the way something with
  // mass does: it takes a moment to get going and it does not overshoot.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 44,
    damping: 24,
    mass: 1,
  });
  const lightBackground = useTransform(
    smoothProgress,
    trackStops,
    dayTrack(false),
  );
  const darkBackground = useTransform(
    smoothProgress,
    trackStops,
    dayTrack(true),
  );

  useMotionValueEvent(smoothProgress, "change", (value) => {
    const next = stageIndex(value, steps.length);
    setActive((current) => (current === next ? current : next));
  });

  const jumpTo = useCallback((index: number) => {
    const section = ref.current;
    if (!section) return;
    const box = section.getBoundingClientRect();
    const start = window.scrollY + box.top;
    const distance = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: start + distance * settledAt(index),
      behavior: "smooth",
    });
  }, []);

  return (
    <section id="day" aria-label="Your day in rhythm">
      {/*
        Which of the two layouts shows is decided in CSS, not here. Deciding it
        in JavaScript would mean the server and the client disagree about the
        markup whenever reduced motion is on, and React answers a disagreement
        by rebuilding the page from scratch, taking the theme with it.
      */}
      <div className="motion-safe:lg:hidden">
        {steps.map((item, index) => (
          <StackedStep key={item.label} item={item} index={index} />
        ))}
      </div>

      <div
        ref={ref}
        className="relative hidden motion-safe:lg:block"
        style={{ height: `${TRACK_SVH}svh` }}
      >
        {/*
          The four steps of the pinned sequence are scroll positions, not
          elements, so there is nothing for the browser to snap to. These
          rulers sit at the scroll offset where each step is settled and give
          it something. They are hairlines with no paint and no content.
        */}
        {steps.map((item, index) => (
          <div
            key={`snap-${item.label}`}
            aria-hidden="true"
            data-snap
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{
              top: `${(((TRACK_SVH - 100) * settledAt(index)) / TRACK_SVH) * 100}%`,
            }}
          />
        ))}

        <motion.div
          style={{ backgroundColor: dark ? darkBackground : lightBackground }}
          className="sticky top-0 h-[100svh] overflow-hidden text-ink"
        >
          <div
            aria-hidden="true"
            className="absolute -left-[7vw] top-[17%] font-display text-[30vw] font-extrabold leading-none text-ink/[0.055]"
          >
            {String(active + 1).padStart(2, "0")}
          </div>
          <Container className="relative flex h-full flex-col pb-7 pt-28">
            <div className="flex items-center justify-between gap-8">
              <p className="label flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                Chapter 01&nbsp; / &nbsp;Your day, in rhythm
              </p>
              <p className="font-display text-sm font-extrabold">
                Scroll to move through the day
              </p>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1.08fr_0.92fr] items-center gap-12 xl:gap-20">
              <div className="grid">
                {steps.map((item, index) => (
                  <StepCopy
                    key={item.label}
                    item={item}
                    index={index}
                    progress={smoothProgress}
                  />
                ))}
              </div>
              <div className="flex h-full min-h-0 items-center justify-center">
                <div className="w-[min(20rem,39vh)]">
                  <PhoneFrame>
                    <div className="relative aspect-[680/1478] bg-[#f1f4fb] transition-colors duration-300 dark:bg-[#070b15]">
                      {steps.map((item, index) => (
                        <StepVisual
                          key={item.label}
                          item={item}
                          index={index}
                          progress={smoothProgress}
                        />
                      ))}
                    </div>
                  </PhoneFrame>
                </div>
              </div>
            </div>

            <ol className="grid grid-cols-4 border-t border-ink/20 pt-4">
              {steps.map((item, index) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => jumpTo(index)}
                    aria-label={`Go to ${item.label}`}
                    aria-current={active === index ? "step" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-lg text-left transition-opacity duration-200 ${
                      active === index
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-80"
                    }`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full border-2 border-ink transition-colors duration-200 ${
                        active === index ? "bg-ink" : "bg-transparent"
                      }`}
                    />
                    <span className="hidden font-display text-sm font-extrabold xl:inline">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </Container>
        </motion.div>
      </div>
    </section>
  );
}
