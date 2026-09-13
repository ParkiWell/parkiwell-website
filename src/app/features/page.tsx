import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";
import { features } from "@/content/features";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Parkinson's Care App Features",
  "Explore ParkiWell's symptom tracking, medication reminders, guided speech and movement practice, and offline records. Coming to iPhone and Android.",
  "/features",
);

export default function FeaturesPage() {
  return (
    <article className="pb-24 pt-32 sm:pt-36">
      <Container width="narrow">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "App features", path: "/features" },
          ]}
        />
        <p className="label text-brand-strong">The ParkiWell feature guide</p>
        <h1 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight">
          A Parkinson&rsquo;s care app for your daily routine.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          ParkiWell brings symptom records, medication schedules, and guided
          speech and movement practice into one place. This guide explains how
          those tools work, what stays on your device, and which features are
          still in development.
        </p>
        <p className="mt-4 text-base text-muted">
          Coming to iPhone and Android. ParkiWell is free to use, with no ads or
          data sales.
        </p>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {features.map((feature) => (
            <section key={feature.slug} className="py-8">
              <h2 className="text-2xl font-bold">
                <Link href={`/features/${feature.slug}`} className="text-link">
                  {feature.label}
                </Link>
              </h2>
              <p className="mt-4 leading-relaxed text-muted">{feature.intro}</p>
              <Link
                href={`/features/${feature.slug}`}
                className="text-link mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold"
              >
                Explore {feature.label.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          ))}
        </div>
        <div className="prose-legal mt-10">
          <h2 id="support-resources">
            Parkinson&rsquo;s education and support resources
          </h2>
          <p>
            The Community area collects research, educational videos, specialist
            directories, events, helplines, and daily living guides. It gives
            you a place to find resources alongside the tools you use to
            organize your day. Online resources and linked videos need an
            internet connection.
          </p>
          <h2>Offline records, optional synchronization</h2>
          <p>
            Your records are saved on your device and stay available offline.
            You can use ParkiWell without creating an account. If you choose an
            account, offline changes wait to sync until a connection returns.
            Charts and pattern summaries are computed on your device.
          </p>
          <p>
            Without an account, records cannot be recovered if you lose the
            device. An account lets you restore previously synced records by
            signing in on a new phone. Read the{" "}
            <Link href="/privacy">privacy policy</Link> for storage and deletion
            details.
          </p>
          <h2>Designed for everyday use</h2>
          <p>
            ParkiWell includes large touch targets, screen reader labels,
            reduced motion support, and light and dark themes. The app has no
            advertising or third party trackers, and health records are never
            sold to data brokers.
          </p>
          <h2>What is still in development?</h2>
          <p>
            The camera-based movement coach is planned for a future release. It
            is separate from guided video practice and is not part of the
            current experience. Its intended feedback consists of observations
            about a practice session, never a diagnosis or a measure of your
            condition.
          </p>
          <p>
            For help with notifications, account deletion, or app questions,
            visit <Link href="/support">ParkiWell support</Link>.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages
            -- native navigation preserves the cross-page launch-list fragment */}
        <a href="/#get" className="premium-button mt-8">
          Get notified when ParkiWell launches{" "}
          <ArrowRight className="h-4 w-4" />
        </a>
      </Container>
    </article>
  );
}
