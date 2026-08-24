"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { ArrowRight, ChevronDown } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { useStillness } from "@/hooks/use-stillness";

const questions = [
  {
    question: "Can I use ParkiWell without a connection?",
    answer:
      "Yes. Records live on your device and stay available offline. An optional account queues offline changes until a connection returns.",
  },
  {
    question: "What does the movement coach do?",
    answer:
      "The movement coach, still in development, guides seated and standing exercise sessions through your phone's camera. As you move, it suggests small adjustments, like making the next repetition a little larger or keeping a steadier pace, and when you finish it summarizes how the session went. Tracking runs on your device, and the camera feed is never recorded or uploaded.",
  },
  {
    question: "Is ParkiWell a medical device?",
    answer:
      "ParkiWell is an organizational and educational tool. It does not provide medical advice, diagnosis, or treatment. Movement coach observations describe a single practice session; they do not measure symptoms or track your condition.",
  },
  {
    question: "Where do guided sessions come from?",
    answer:
      "The app links to videos published by established Parkinson's organizations and programs. Each session shows its source and review date.",
  },
  {
    question: "What does ParkiWell cost?",
    answer: "ParkiWell is free to use, with no ads or data sales.",
  },
  {
    question: "How do I delete an account?",
    answer:
      "Open Profile, choose Settings, then choose Delete account. You can also email the ParkiWell team and ask for help.",
  },
] as const;

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const still = useStillness();
  const baseId = useId();

  return (
    <section
      id="questions"
      data-chapter="questions"
      data-settle="1"
      className="chapter flex min-h-[100svh] items-center py-28 text-ink"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24 xl:gap-32">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="label">Chapter 03&nbsp; / &nbsp;Good to know</p>
            <h2 className="display mt-7 max-w-[7ch] text-[clamp(4rem,8vw,7.5rem)]">
              Ask away.
            </h2>
            <p className="mt-7 max-w-[29rem] text-[1.1rem] font-semibold leading-relaxed text-muted">
              Straight answers to the questions we hear most. If yours is not
              here, send it over: a person reads every support message.
            </p>
            <Link
              href="/support"
              className="group mt-8 inline-flex items-center gap-3 font-extrabold text-brand-strong"
            >
              Visit support
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="border-t border-ink/15">
            {questions.map((item, index) => {
              const isOpen = open === index;
              const panelId = `${baseId}-panel-${index}`;
              const buttonId = `${baseId}-button-${index}`;

              return (
                <div key={item.question} className="border-b border-ink/15">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                  >
                    <span className="flex items-start gap-4 sm:gap-6">
                      <span className="numeral mt-1 text-sm text-brand-strong">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[1.2rem] font-extrabold leading-tight tracking-[-0.03em] sm:text-[1.45rem]">
                        {item.question}
                      </span>
                    </span>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink/20 transition-colors duration-200 ${
                        isOpen ? "bg-ink text-bg" : "group-hover:bg-surface-2"
                      }`}
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: still ? 0 : 0.28,
                          ease: [0.22, 0.61, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[43rem] pb-7 pl-10 pr-4 text-[1rem] font-semibold leading-relaxed text-muted sm:pl-[4.6rem] sm:text-[1.08rem]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
