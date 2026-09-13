"use client";

import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { ArrowRight, Heart, Person, Pill, Play } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { Reveal } from "@/components/ui/reveal";
import { stageIndex, stageOffset, stagePresence } from "@/lib/stages";
import { screens } from "@/lib/screens";
import { TRACK_SVH, settledAt } from "@/lib/story";
import { dayTrack } from "@/lib/tones";

export type Step = {
  label: string;
  title: string;
  body: string;
  feature: string;
  href: string;
  screen: (typeof screens)[keyof typeof screens];
  alt: string;
  icon: typeof Heart;
};

/** The four stops of the tour, in the order the phone visits them. */
export const steps: Step[] = [
  {
    label: "Symptom records",
    href: "/features/symptom-tracking",
    title: "Review your symptoms",
    body: "View symptom and medication activity together, and record notes about changes you observe.",
    feature: "Symptom and medication records",
    screen: screens.home,
    alt: "The Home screen showing symptom activity, medication activity, and a personal pattern summary.",
    icon: Heart,
  },
  {
    label: "Medications",
    href: "/features/medication-reminders",
    title: "Manage your medications",
    body: "Review your medication schedule and doses due today. Enable reminders as needed.",
    feature: "Medication schedules and reminders",
    screen: screens.manage,
    alt: "The Manage screen showing medications due today and medication tools.",
    icon: Pill,
  },
  {
    label: "Guided practice",
    href: "/features/speech-movement-practice",
    title: "Plan your practice",
    body: "Set weekly goals for speech and movement practice, view your next session, and review completed sessions.",
    feature: "Speech and movement sessions",
    screen: screens.recovery,
    alt: "The Recovery screen showing a weekly practice goal and a chair workout ready to begin.",
    icon: Play,
  },
  {
    label: "Support resources",
    href: "/features#support-resources",
    title: "Access support resources",
    body: "The Community area collects research, educational videos, specialist directories, events, helplines, and daily living guides in one place.",
    feature: "Research, education, and support",
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
 * One step's reading surface. The phone is not here: it belongs to the story
 * layer and stays put through the whole tour. Only the words change, and they
 * always change in the same place, rising in from below and leaving upward.
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
    stageOffset(value, index, steps.length, 28),
  );
  // An invisible layer still sits above its neighbours, so take it out of the
  // page entirely once it has fully handed over.
  const visibility = useTransform(presence, (value) =>
    value < 0.01 ? ("hidden" as const) : ("visible" as const),
  );

  return (
    <motion.article
      style={{ opacity: presence, visibility, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <p className="label flex items-center gap-4 text-muted">
        <span className="numeral text-base">0{index + 1}</span>
        {item.label}
      </p>
      <h3 className="display mt-5 max-w-[11ch] text-[clamp(2.75rem,3.9vw,4.4rem)] text-ink">
        {item.title}
      </h3>
      <p className="mt-6 max-w-[26rem] text-[1.05rem] leading-relaxed text-muted xl:text-[1.1rem]">
        {item.body}
      </p>
      <Link href={item.href} className="journey-feature text-link">
        <item.icon className="h-4 w-4" />
        {item.feature}
      </Link>
    </motion.article>
  );
}

/**
 * A step button is also that step's progress: the track under the label fills
 * across exactly the stretch of scroll the step owns, so the rail reads as four
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
          active ? "opacity-100" : "opacity-55 hover:opacity-100"
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
                  sizes="(max-width: 767px) 176px, 240px"
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
              <Link
                href={item.href}
                className="text-link mt-5 inline-flex min-h-11 items-center text-sm font-bold"
              >
                {item.feature} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
 * The feature tour.
 *
 * `progress` is the tour's smoothed scroll progress, owned by `Story` because
 * the phone above this panel reads the same value to change its screens. The
 * pinned track is measured through `pinnedRef` for the same reason.
 */
export function Journey({
  pinnedRef,
  progress,
  arrivalRaw,
  arrival,
}: {
  pinnedRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  arrivalRaw: MotionValue<number>;
  arrival: MotionValue<number>;
}) {
  const [active, setActive] = useState(0);
  const dark = useSyncExternalStore(
    subscribeToTheme,
    readDarkTheme,
    () => false,
  );
  const lightBackground = useTransform(progress, trackStops, dayTrack(false));
  const darkBackground = useTransform(progress, trackStops, dayTrack(true));
  // The panel slides up under the phone to reach its pin, and its colour
  // matches the hero's foot, so the slide itself is invisible. The words
  // would give it away, so they fade in late and climb at a fifth of the
  // panel's speed: from the visitor's side, the tour appears in place.
  const contentY = useTransform(arrivalRaw, (value) =>
    value >= 1 ? "0svh" : `${-(1 - value) * 80}svh`,
  );
  // Opacity alone, unlike the step panels: the words are in the right place
  // the whole time, and hiding them as well would leave anything that scrolls
  // to the panel (a focused link, a test driving a step button) waiting for
  // a fade that only the scroll can finish.
  const contentFade = useTransform(arrival, [0.4, 1], [0, 1]);

  useMotionValueEvent(progress, "change", (value) => {
    const next = stageIndex(value, steps.length);
    setActive((current) => (current === next ? current : next));
  });

  const jumpTo = useCallback(
    (index: number) => {
      const section = pinnedRef.current;
      if (!section) return;
      const box = section.getBoundingClientRect();
      const start = window.scrollY + box.top;
      const distance = section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: start + distance * settledAt(index),
        behavior: "smooth",
      });
    },
    [pinnedRef],
  );

  return (
    <section id="day" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">
        Parkinson&rsquo;s care app features
      </h2>
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
        ref={pinnedRef}
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
          className="sticky top-0 h-[100svh] text-ink"
        >
          {/* Clipped on its own: the panel stays open so the arriving copy can
              sit above its top edge while it is still sliding into place. */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-[2vw] bottom-[2%] font-display text-[24vw] font-medium leading-none text-ink/[0.035]">
              {String(active + 1).padStart(2, "0")}
            </div>
          </div>
          <motion.div
            style={{ y: contentY, opacity: contentFade }}
            className="relative h-full"
          >
            <Container className="relative flex h-full flex-col pb-8 pt-28">
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

              {/* The middle column is empty on purpose: the phone sits there. */}
              <div className="journey-grid min-h-0 flex-1">
                <div className="relative h-full min-h-0">
                  {steps.map((item, index) => (
                    <StepPanel
                      key={item.label}
                      item={item}
                      index={index}
                      progress={progress}
                    />
                  ))}
                </div>
                <div aria-hidden="true" />
                <ol className="journey-rail">
                  {steps.map((item, index) => (
                    <StepButton
                      key={item.label}
                      item={item}
                      index={index}
                      active={active === index}
                      progress={progress}
                      onJump={jumpTo}
                    />
                  ))}
                </ol>
              </div>
            </Container>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
