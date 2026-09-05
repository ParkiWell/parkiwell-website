import type { Metadata } from "next";
import { Assurance } from "@/components/sections/assurance";
import { Closing } from "@/components/sections/closing";
import { FutureMovementCoach } from "@/components/sections/coach";
import { Faq } from "@/components/sections/faq";
import { Story } from "@/components/sections/story";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} | ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Story />
      <Assurance />
      <FutureMovementCoach />
      <Faq />
      <Closing />
    </>
  );
}
