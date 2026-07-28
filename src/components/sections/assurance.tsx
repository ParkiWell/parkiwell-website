import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Chart,
  Lock,
  Offline,
  Shield,
} from "@/components/icons";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const facts = [
  {
    icon: Offline,
    title: "Saved on your phone first",
    body: "Each entry is written to your device right away, so ParkiWell keeps working without a connection.",
  },
  {
    icon: Lock,
    title: "Sync is your choice",
    body: "An account is optional. Synced records travel over an encrypted connection and remain private to your account.",
  },
  {
    icon: Shield,
    title: "Free from tracking",
    body: "ParkiWell has no advertising or third party trackers. Health records are never sold to data brokers.",
  },
  {
    icon: Chart,
    title: "Summaries stay local",
    body: "Charts and pattern summaries are computed on your device from your own records.",
  },
];

export function Assurance() {
  return (
    <section
      id="privacy"
      data-chapter="privacy"
      data-settle="1"
      className="chapter relative flex min-h-[100svh] items-center overflow-hidden py-28 text-ink"
    >
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 xl:gap-28">
          <Reveal>
            <div className="relative">
              <p className="label flex items-center gap-3">
                <Lock className="h-4 w-4" /> Chapter 02&nbsp; / &nbsp;Privacy
              </p>
              <h2 className="display mt-7 max-w-[8ch] text-[clamp(4rem,8vw,7.2rem)]">
                Your day stays yours.
              </h2>
              <p className="mt-8 max-w-[34rem] text-[1.12rem] font-semibold leading-relaxed opacity-75 sm:text-[1.25rem]">
                Health information deserves a quiet place. ParkiWell keeps your
                records close and gives you control over optional sync.
              </p>
              <Link
                href="/privacy"
                className="group mt-9 inline-flex min-h-14 items-center gap-3 rounded-full bg-ink px-7 font-extrabold text-bg transition-transform duration-200 hover:-translate-y-1"
              >
                Read the privacy policy
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2">
            {facts.map(({ icon: Icon, title, body }, index) => (
              <Reveal as="li" key={title} delay={index * 0.07}>
                <div
                  className="min-h-[14rem] rounded-[1.5rem] border border-ink/15 bg-surface p-6 shadow-card transition-transform duration-500 hover:-translate-y-0.5 sm:p-7"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ink/12 bg-bg">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-[1.45rem] font-extrabold leading-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-[0.98rem] font-semibold leading-relaxed opacity-75">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ink/20 pt-7 text-sm font-extrabold">
            <span className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" /> Screen reader labels
            </span>
            <span>Large touch targets</span>
            <span>Reduced motion support</span>
            <span>Light and dark themes</span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
