"use client";

import { motion } from "motion/react";
import { Camera, Lock } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { useStillness } from "@/hooks/use-stillness";

function FuturePose({ still }: { still: boolean }) {
  // A zero length pass runs the keyframes to their last value, which is the
  // arms back down where they started, so stillness reads as a drawing.
  const armTransition = {
    duration: still ? 0 : 4.2,
    times: [0, 0.3, 0.72, 1],
    ease: [0.45, 0, 0.2, 1] as const,
  };

  return (
    <svg
      viewBox="0 0 280 300"
      className="h-full w-full"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="140" cy="64" r="22" strokeWidth="5" />
      <path d="M140 87v91M106 109h68M112 180h56" strokeWidth="5" />
      <path d="M114 180 102 239h50M166 180l12 59h-50" strokeWidth="5" opacity="0.58" />
      <motion.g
        whileInView={{ rotate: [0, 76, 76, 0] }}
        viewport={{ once: true, amount: 0.4 }}
        transition={armTransition}
        style={{ transformBox: "view-box", transformOrigin: "106px 109px" }}
      >
        <path d="M106 109 91 196" strokeWidth="5" />
        <circle cx="91" cy="196" r="7" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.g
        whileInView={{ rotate: [0, -76, -76, 0] }}
        viewport={{ once: true, amount: 0.4 }}
        transition={armTransition}
        style={{ transformBox: "view-box", transformOrigin: "174px 109px" }}
      >
        <path d="M174 109l15 87" strokeWidth="5" />
        <circle cx="189" cy="196" r="7" fill="currentColor" stroke="none" />
      </motion.g>
      <g fill="#d9bd79" stroke="#12363a" strokeWidth="1.5">
        <circle cx="140" cy="64" r="4.5" />
        <circle cx="106" cy="109" r="4.5" />
        <circle cx="174" cy="109" r="4.5" />
        <circle cx="112" cy="180" r="4.5" />
        <circle cx="168" cy="180" r="4.5" />
      </g>
    </svg>
  );
}

export function FutureMovementCoach() {
  const still = useStillness();

  return (
    <section
      id="future"
      data-chapter="future"
      data-settle="1"
      className="chapter flex min-h-[68svh] items-center py-20 text-ink"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 xl:gap-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: still ? 0 : 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label flex items-center gap-3 text-subtle">
              <Camera className="h-4 w-4 text-brand-strong" /> The movement coach
            </p>
            <h2 className="display mt-7 max-w-[12ch] text-[clamp(3rem,5.2vw,4.9rem)]">
              A coach that helps you improve.
            </h2>
            <p className="mt-8 max-w-[38rem] text-[1.08rem] font-semibold leading-relaxed text-muted sm:text-[1.2rem]">
              We are building a movement coach into ParkiWell. It guides seated
              and standing exercise sessions through your phone&rsquo;s camera
              and suggests small adjustments as you go: a little larger, a
              steadier pace, a smoother movement. When you finish, it sums up
              the session, what went well and what to focus on next time.
            </p>
            <div className="mt-8 grid max-w-[36rem] gap-4 border-t border-line-strong pt-6 text-sm font-bold text-muted sm:grid-cols-2">
              <p className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
                Movement tracking runs on your phone. The camera feed is never
                recorded or uploaded.
              </p>
              <p>
                When the camera cannot see you clearly, the coach says so
                rather than guessing.
              </p>
            </div>
            <p className="mt-7 max-w-[38rem] text-sm font-semibold leading-relaxed text-subtle">
              The coach is still in development and has not been clinically
              reviewed. Its observations describe one practice session at a
              time. They do not measure symptoms, diagnose, or replace advice
              from your care team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: still ? 0 : 0.95,
              delay: still ? 0 : 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mx-auto aspect-[1.05] w-full max-w-[32rem] rounded-[2rem] border border-ink/15 bg-surface p-7 shadow-raised sm:p-10"
          >
            <div className="flex items-center">
              <span className="rounded-full border border-ink/15 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
                In development
              </span>
            </div>
            <div className="mx-auto mt-4 h-[78%] max-h-[27rem] text-brand">
              <FuturePose still={still} />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
