import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { PhoneFrame, ThemedPhoneScreen } from "@/components/ui/phone";
import { features } from "@/content/features";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return features.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const feature = features.find((item) => item.slug === slug);
  if (!feature) notFound();
  return pageMetadata(feature.title, feature.description, `/features/${slug}`);
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = features.find((item) => item.slug === slug);
  if (!feature) notFound();

  return (
    <article className="pb-24 pt-32 sm:pt-36">
      <Container width="narrow">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "App features", path: "/features" },
            { name: feature.label, path: `/features/${slug}` },
          ]}
        />
        <p className="label text-brand-strong">{feature.label}</p>
        <h1 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight">
          {feature.heading}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          {feature.intro}
        </p>
        <p className="mt-4 text-sm font-semibold text-muted">
          Coming to iPhone and Android.
        </p>
        <figure className="my-12">
          <div className="mx-auto w-60">
            <PhoneFrame>
              <ThemedPhoneScreen
                screen={feature.screen}
                alt={feature.alt}
                sizes="240px"
                priority
              />
            </PhoneFrame>
          </div>
          <figcaption className="mx-auto mt-5 max-w-md text-center text-sm text-muted">
            {feature.alt}
          </figcaption>
        </figure>
        <div className="prose-legal">
          {feature.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <h2>Explore the rest of your care day</h2>
          <ul>
            {features
              .filter((item) => item.slug !== slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link href={`/features/${item.slug}`}>{item.label}</Link>
                </li>
              ))}
          </ul>
          <p>
            Read about{" "}
            <Link href="/privacy">privacy and offline record storage</Link>, or
            visit <Link href="/support">app support</Link> for help with
            ParkiWell.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages
            -- native navigation preserves the cross-page launch-list fragment */}
        <a href="/#get" className="premium-button mt-8">
          Get notified at launch <ArrowRight className="h-4 w-4" />
        </a>
      </Container>
    </article>
  );
}
