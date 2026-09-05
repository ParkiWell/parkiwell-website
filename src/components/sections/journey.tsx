"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Heart, Person, Pill, Play } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { OrbitSculpture } from "@/components/ui/orbit-sculpture";
import { Reveal } from "@/components/ui/reveal";
import { stageIndex, stageOffset, stagePresence } from "@/lib/stages";
import { screens } from "@/lib/screens";
import { dayTrack } from "@/lib/tones";
import { useSequenceProgress } from "@/hooks/use-sequence-progress";

type Step = {
  label: string;
  title: string;
  body: string;
  screen: (typeof screens)[keyof typeof screens];
  alt: string;
  icon: typeof Heart;
};

const steps: Step[] = [
  {
    label: "Symptom records",
    title: "Review your symptoms",
    body: "View symptom and medication activity together, and record notes about changes you observe.",
    screen: screens.home,
    alt: "The Home screen showing symptom activity, medication activity, and a personal pattern summary.",
    icon: Heart,
  },
  {
    label: "Medications",
    title: "Manage your medications",
    body: "Review your medication schedule and doses due today. Enable reminders as needed.",
    screen: screens.manage,
    alt: "The Manage screen showing medications due today and medication tools.",
    icon: Pill,
  },
  {
    label: "Guided practice",
    title: "Plan your practice",
    body: "Set weekly goals for speech and movement practice, view your next session, and review completed sessions.",
    screen: screens.recovery,
    alt: "The Recovery screen showing a weekly practice goal and a chair workout ready to begin.",
    icon: Play,
  },
  {
    label: "Support resources",
    title: "Access support resources",
    body: "The Community area collects research, educational videos, specialist directories, events, helplines, and daily living guides in one place.",
    screen: screens.community,
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

/**
 * Copy and hardware share a handoff, with less travel for the reading surface
 * and a perspective turn for the device. Neither overlaps the next stage.
 */
function StepPanel({
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
    stageOffset(value, index, steps.length, 32),
  );
  const rotateY = useTransform(
    progress,
    (value) =>
      stageOffset(value, index, steps.length, 35) + [-12, 10, -8, 12][index],
  );
  const scale = useTransform(presence, [0, 1], [0.92, 1]);
  // An invisible layer still sits above its neighbours, so take it out of the
  // page entirely once it has fully handed over.
  const visibility = useTransform(presence, (value) =>
    value < 0.01 ? ("hidden" as const) : ("visible" as const),
  );

  return (
    <motion.div
      style={{ opacity: presence, visibility }}
      className="journey-stage absolute inset-0 grid grid-cols-[1.08fr_0.92fr] items-center gap-12 xl:gap-20"
    >
      <motion.article style={{ y }}>
        <p className="label flex items-center gap-4 text-muted">
          <span className="numeral text-base">0{index + 1}</span>
          {item.label}
        </p>
        <h3 className="display mt-5 max-w-[11ch] text-[clamp(3.3rem,5.8vw,6rem)] text-ink">
          {item.title}
        </h3>
        <p className="mt-7 max-w-[28rem] text-[1.08rem] leading-relaxed text-muted xl:text-[1.15rem]">
          {item.body}
        </p>
        <p className="journey-feature">
          <item.icon className="h-4 w-4" />
          {
            [
              "Symptom and medication records",
              "Medication schedules and reminders",
              "Speech and movement sessions",
              "Research, education, and support",
            ][index]
          }
        </p>
      </motion.article>
      <div className="flex h-full min-h-0 items-center justify-center">
        <motion.div
          style={{ rotateY, rotateZ: [-5, 4, -4, 5][index], scale, y }}
          className="journey-device w-[min(20rem,34svh)]"
        >
          <PhoneFrame>
            <ThemedPhoneScreen
              screen={item.screen}
              alt={item.alt}
              sizes="336px"
            />
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * A step button is also that step's progress: the track under the label fills
 * across exactly the stretch of scroll the step owns, so the row reads as four
 * segments of one journey rather than four dots.
 */
function StepButton({
  item,
  index,
  active,
  progress,
  onJump,
}: {
  item: Step;
  index: number;
  active: boolean;
  progress: MotionValue<number>;
  onJump: (index: number) => void;
}) {
  const fill = useTransform(progress, (value) =>
    Math.min(1, Math.max(0, value * steps.length - index)),
  );

  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(index)}
        aria-label={`Go to ${item.label}`}
        aria-current={active ? "step" : undefined}
        className={`group flex min-h-14 w-full flex-col justify-center gap-3 rounded-lg py-2 text-left transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-60 hover:opacity-100"
        }`}
      >
        <span className="flex items-center gap-3 font-display text-xs font-bold xl:text-sm">
          <span className="numeral opacity-60">0{index + 1}</span>
          {item.label}
        </span>
        <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-ink/15">
          <motion.span
            style={{ scaleX: fill }}
            className="absolute inset-0 origin-left rounded-full bg-ink"
          />
        </span>
      </button>
    </li>
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
      data-settle="1"
      className="chapter-flow flex min-h-[100svh] items-center text-ink"
    >
      <Container className="py-24">
        <Reveal>
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
            <div className="order-2 mx-auto w-[min(11rem,46vw)] md:w-[15rem]">
              <PhoneFrame>
                <ThemedPhoneScreen
                  screen={item.screen}
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
const STEP_SVH = 150;
const RUN_OUT_SVH = 60;
const TRACK_SVH = steps.length * STEP_SVH + RUN_OUT_SVH;

/**
 * Where each step is settled, as a fraction of the panel's scroll travel.
 *
 * `stagePresence` gives step k the slice of progress from k/n to (k+1)/n, so
 * the middle of that slice is where its copy is fully opaque and nothing is
 * handing over. That is the position both the snap points and the step buttons
 * aim at, so clicking a step and scrolling to it come to rest in one place.
 */
const JOURNEY_ENTER = 0.06;
const JOURNEY_FINISH = 0.88;
const settledAt = (index: number) =>
  JOURNEY_ENTER +
  ((index + 0.5) / steps.length) * (JOURNEY_FINISH - JOURNEY_ENTER);

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
  // Follow a flick promptly while softening the small steps from a mouse wheel.
  const smoothProgress = useSequenceProgress(
    scrollYProgress,
    JOURNEY_ENTER,
    JOURNEY_FINISH,
  );
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
  const orbitRotate = useTransform(smoothProgress, [0, 1], [-15, 100]);

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
    <section id="day" aria-label="Application features">
      {/*
        Which of the two layouts shows is decided in CSS, not here. Deciding it
        in JavaScript would mean the server and the client disagree about the
        markup whenever reduced motion is on, and React answers a disagreement
        by rebuilding the page from scratch, taking the theme with it.
      */}
      <div className="journey-stacked motion-safe:lg:hidden">
        {steps.map((item, index) => (
          <StackedStep key={item.label} item={item} index={index} />
        ))}
      </div>

      <div
        ref={ref}
        className="journey-pinned relative hidden motion-safe:lg:block"
        style={{ height: `${TRACK_SVH}svh` }}
      >
        {/*
          The four steps are scroll positions rather than elements, so there is
          nothing to come to rest on. These rulers stand in. Each is one
          viewport tall and centred on the offset where its step is settled, so
          the gravity that centres a chapter centres a step the same way, and
          each carries extra weight: a step should hold on a little harder than
          the chapters either side, because there are four of them inside one.
        */}
        {steps.map((item, index) => (
          <div
            key={`settle-${item.label}`}
            aria-hidden="true"
            data-settle="1.35"
            className="pointer-events-none absolute inset-x-0 h-[100svh]"
            style={{
              top: `calc(${(((TRACK_SVH - 100) * settledAt(index)) / TRACK_SVH) * 100}% )`,
            }}
          />
        ))}

        <motion.div
          style={{ backgroundColor: dark ? darkBackground : lightBackground }}
          className="sticky top-0 h-[100svh] overflow-hidden text-ink"
        >
          <div
            aria-hidden="true"
            className="absolute -left-[2vw] bottom-[2%] font-display text-[27vw] font-medium leading-none text-ink/[0.035]"
          >
            {String(active + 1).padStart(2, "0")}
          </div>
          <div className="journey-orbit" aria-hidden="true">
            <motion.div style={{ rotate: orbitRotate }}>
              <OrbitSculpture />
            </motion.div>
          </div>
          <Container className="relative flex h-full flex-col pb-7 pt-28">
            <div className="flex items-center justify-between gap-8">
              <p className="label flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                Chapter 01&nbsp; / &nbsp;Application features
              </p>
              <a
                href="#privacy"
                className="text-link inline-flex min-h-11 items-center gap-2 text-xs font-bold text-muted"
              >
                Skip the tour <ArrowRight className="h-3 w-3 rotate-90" />
              </a>
            </div>

            <div className="relative min-h-0 flex-1">
              {steps.map((item, index) => (
                <StepPanel
                  key={item.label}
                  item={item}
                  index={index}
                  progress={smoothProgress}
                />
              ))}
            </div>

            <ol className="grid grid-cols-4 gap-4 pt-4 sm:gap-6">
              {steps.map((item, index) => (
                <StepButton
                  key={item.label}
                  item={item}
                  index={index}
                  active={active === index}
                  progress={smoothProgress}
                  onJump={jumpTo}
                />
              ))}
            </ol>
          </Container>
        </motion.div>
      </div>
    </section>
  );
}
