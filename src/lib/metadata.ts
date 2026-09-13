import type { Metadata } from "next";
import { site } from "@/lib/site";
import { socialImage } from "@/lib/social-image";

/** Keep each page's search snippet, canonical URL, and share preview together. */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  const url = new URL(path, site.url).href;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title: fullTitle,
      description,
      locale: site.locale,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}
