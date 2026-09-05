"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Camera, Lock } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { useSequenceProgress } from "@/hooks/use-sequence-progress";

/**
 * The arms lift and lower on a slow loop in CSS (see `.movement-arm`), not on
 * the scroll: a pose tied to the wheel jerked with every notch, and it fell
 * back down whenever the page's gravity pulled the chapter back to its start.
 */
function MovementFigure() {
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
      <circle cx="140" cy="64" r="22" strokeWidth="3" />
      <path d="M140 87v91M106 109h68M112 180h56" strokeWidth="3" />
      <path d="M114 180 102 239h50M166 180l12 59h-50" strokeWidth="3" />
      <g className="movement-arm movement-arm--left">
        <path d="M106 109 91 196" strokeWidth="3" />
        <circle cx="91" cy="196" r="5" fill="currentColor" stroke="none" />
      </g>
      <g className="movement-arm movement-arm--right">
        <path d="M174 109l15 87" strokeWidth="3" />
        <circle cx="189" cy="196" r="5" fill="currentColor" stroke="none" />
      </g>
      <g className="text-ink" fill="var(--surface)" strokeWidth="2">
        <circle cx="106" cy="109" r="5" />
        <circle cx="174" cy="109" r="5" />
        <circle cx="112" cy="180" r="5" />
        <circle cx="168" cy="180" r="5" />
      </g>
      <g strokeWidth="0.75" strokeDasharray="3 5" opacity="0.45">
        <path d="M49 64h58M173 64h58M49 180h45M186 180h45M140 15v20M140 258v28" />
      </g>
    </svg>
  );
}

export function FutureMovementCoach() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // The only thing the scroll moves here is a slow turn of the stage, so it
  // takes a heavier spring than the tour: each wheel notch eases it round
  // rather than nudging it.
  const progress = useSequenceProgress(scrollYProgress, 0.08, 0.8, {
    stiffness: 70,
    damping: 22,
  });
  const rotateY = useTransform(progress, [0, 1], [-16, 8]);
  const rotateX = useTransform(progress, [0, 1], [5, -2]);
  const ringRotate = useTransform(progress, [0, 1], [0, 48]);

  return (
    <section
      ref={ref}
      id="future"
      data-chapter="future"
      className="chapter coach-chapter relative text-ink"
    >
      {/*
        Both ends of the turn are places to rest. With only the start marked,
        a pause part way through let the page pull the chapter back to where
        it began, and the scene played backwards.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]"
        data-settle="1"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[100svh] hidden h-[100svh] motion-safe:lg:block"
        data-settle="1"
        aria-hidden="true"
      />
      <div className="coach-viewport">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p className="label flex items-center gap-3 text-muted">
                <Camera className="h-4 w-4" /> In development
              </p>
              <h2 className="display mt-7 max-w-[12ch] text-[clamp(3rem,5.4vw,5.8rem)]">
                Guided movement practice.
              </h2>
              <p className="mt-7 max-w-[30rem] text-[1.08rem] leading-relaxed text-muted">
                The movement coach is in development. It uses your phone&rsquo;s
                camera to guide seated and standing exercise sessions, with
                observations on movement range, pace, and smoothness.
              </p>
              <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-muted">
                A session summary identifies areas of focus for subsequent
                practice.
              </p>
              <div className="mt-7 flex max-w-[30rem] items-start gap-3 border-t border-ink/20 pt-5 text-sm text-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <p>
                  Movement tracking runs on your device. The camera feed is
                  never recorded or uploaded.
                </p>
              </div>
              <p className="mt-6 max-w-[31rem] text-xs leading-relaxed text-muted">
                In development. Not yet clinically reviewed. Observations
                describe one practice session, never symptoms or diagnoses, and
                do not replace your care team&rsquo;s advice.
              </p>
            </div>
            <div
              className="movement-scene"
              role="img"
              aria-label="Illustration of a seated movement practice. The movement coach is in development."
            >
              <div className="movement-scene-label label">
                <span className="scene-dot" /> Movement coach preview
              </div>
              <motion.div
                className="movement-space"
                style={{ rotateY, rotateX }}
              >
                <div className="movement-floor">
                  <motion.div
                    className="movement-floor-rings"
                    style={{ rotate: ringRotate }}
                  >
                    {[0, 1, 2, 3, 4].map((ring) => (
                      <span key={ring} style={{ inset: `${ring * 8}%` }} />
                    ))}
                  </motion.div>
                </div>
                <div className="movement-plane movement-plane-back" />
                <div className="movement-plane movement-plane-front">
                  <span className="movement-corner top-0 left-0" />
                  <span className="movement-corner right-0 bottom-0 rotate-180" />
                  <MovementFigure />
                </div>
              </motion.div>
              <div className="movement-scene-footer">
                <span className="label">In development</span>
                <span>Illustrative preview</span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
