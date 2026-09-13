import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { features } from "@/content/features";
import { screens } from "@/lib/screens";

export default function sitemap(): MetadataRoute.Sitemap {
  // A rebuild is not a content update. Omit lastmod until dates are maintained
  // with the content, rather than claiming every page changed on every deploy.
  return [
    {
      url: `${site.url}/`,
      images: Object.values(screens).map((screen) => `${site.url}${screen.light}`),
    },
    ...["/features", "/support", "/privacy", "/terms"].map((route) => ({
      url: `${site.url}${route}`,
    })),
    ...features.map((feature) => ({
      url: `${site.url}/features/${feature.slug}`,
      images: [`${site.url}${feature.screen.light}`],
    })),
  ];
}
