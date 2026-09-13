import { StructuredData } from "@/components/structured-data";
import { Assurance } from "@/components/sections/assurance";
import { Closing } from "@/components/sections/closing";
import { FutureMovementCoach } from "@/components/sections/coach";
import { Faq } from "@/components/sections/faq";
import { Story } from "@/components/sections/story";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(site.title, site.description, "/");

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site.url}/#organization`,
              name: site.name,
              url: `${site.url}/`,
              logo: `${site.url}/brand/icon-512.png`,
              email: site.email,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: site.email,
                url: `${site.url}/support`,
              },
            },
            {
              "@type": "WebSite",
              "@id": `${site.url}/#website`,
              name: site.name,
              url: `${site.url}/`,
              description: site.description,
              inLanguage: "en",
              publisher: { "@id": `${site.url}/#organization` },
            },
          ],
        }}
      />
      <Story />
      <Assurance />
      <FutureMovementCoach />
      <Faq />
      <Closing />
    </>
  );
}
