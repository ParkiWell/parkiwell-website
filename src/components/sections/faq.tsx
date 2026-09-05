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
      "The movement coach, still in development, guides seated and standing exercise sessions through your phone's camera. It provides observations on movement range, pace, and smoothness, followed by a session summary. Tracking runs on your device, and the camera feed is never recorded or uploaded.",
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
      className="chapter py-28 text-ink sm:py-36"
    >
      <Container>
        <div className="faq-layout">
          <div className="faq-intro">
            <h2 className="display max-w-[12ch] text-[clamp(3.5rem,6.5vw,6.7rem)]">
              Frequently asked questions.
            </h2>
            <p className="mt-7 max-w-[26rem] text-base leading-relaxed text-muted">
              Information about app features, privacy, and account management.
              Contact support for additional assistance.
            </p>
            <Link
              href="/support"
              className="text-link group mt-5 inline-flex min-h-12 items-center gap-3 text-sm font-bold text-ink"
            >
              Visit support
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="faq-questions border-t border-ink/20">
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
                      <span className="numeral mt-1 text-sm text-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[1.15rem] font-medium leading-snug tracking-[-0.025em] sm:text-[1.3rem]">
                        {item.question}
                      </span>
                    </span>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors duration-200 ${
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
                        <p className="max-w-[43rem] pb-7 pl-10 pr-4 text-[1rem] font-normal leading-relaxed text-muted sm:pl-[4.6rem] sm:text-[1.08rem]">
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
