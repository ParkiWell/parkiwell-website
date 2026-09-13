import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowRight, ChevronDown, Lock, Shield } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "App Support & Account Help",
  "Get help with ParkiWell: contact the team, make a privacy or deletion request, and read answers to the questions people ask most.",
  "/support",
);

const topics = [
  {
    q: "How do I delete my account and everything synced with it?",
    a: (
      <>
        Open Profile, then Settings, then Delete account. That removes the
        account and the records synced with it. If you would rather we do it,
        email us from the address on the account and say so.
      </>
    ),
  },
  {
    q: "I lost my phone. Are my records gone?",
    a: (
      <>
        If you never created an account, records lived only on that device and
        are not recoverable. If you did create one, sign in on the new phone and
        your synced records come back.
      </>
    ),
  },
  {
    q: "Where do guided sessions come from?",
    a: (
      <>
        Speech and movement sessions link to videos published by established
        Parkinson&rsquo;s organizations and programs. Each one is credited in the
        app with its source and review date.
      </>
    ),
  },
  {
    q: "Is the movement coach available?",
    a: (
      <>
        The movement coach is in development for a future release. The vision
        is to guide focused movement sessions and share observations on your
        phone. It is not part of the current ParkiWell experience.
      </>
    ),
  },
  {
    q: "Reminders are not arriving.",
    a: (
      <>
        Check that notifications are allowed for ParkiWell in your phone
        settings, and that the medication has a scheduled time saved. If it
        still fails, email us with your phone model and operating system
        version.
      </>
    ),
  },
  {
    q: "Is ParkiWell medical advice?",
    a: (
      <>
        No. It is an organizational and educational tool, not a medical device.
        It does not provide medical advice, diagnosis, or treatment. Always talk
        to your care team about your health.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <>
      <section className="border-t border-line pb-20 pt-32 sm:pt-36">
        <Container width="narrow">
          <Reveal>
            <p className="mb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-strong">
              Support
            </p>
            <h1 className="text-[2.25rem] font-bold leading-tight sm:text-[2.75rem]">
              ParkiWell app support
            </h1>
            <p className="measure mt-5 text-[1.0625rem] text-muted">
              Questions, problems, feedback, account requests, privacy
              requests. Write to us and a person will answer, usually within a
              couple of days.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${site.email}`}
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-brand"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                  <Shield className="h-5 w-5" />
                </span>
                <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                  Email the team
                </h2>
                <p className="mt-2 text-[0.9875rem] text-muted">
                  {site.email}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand-strong">
                  Start a message
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </a>

              <Link
                href="/privacy"
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-brand"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Lock className="h-5 w-5" />
                </span>
                <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                  Privacy and data requests
                </h2>
                <p className="mt-2 text-[0.9875rem] text-muted">
                  Read how your information is handled, or ask us to export or
                  delete it.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand-strong">
                  Read the policy
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container width="narrow">
          <Reveal>
            <h2 className="text-[1.75rem] font-bold leading-tight sm:text-[2rem]">
              Answers to what people ask most
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {topics.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-display text-[1.0625rem] font-semibold text-ink transition-colors hover:bg-surface-2 sm:px-6">
                    {q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-subtle transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-[0.9875rem] text-muted sm:px-6">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-8 text-[0.9375rem] text-subtle">
              Still stuck? Email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-brand-strong underline underline-offset-4"
              >
                {site.email}
              </a>{" "}
              and we will help.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
