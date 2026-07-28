import type { Metadata } from "next";
import { Assurance } from "@/components/sections/assurance";
import { Closing } from "@/components/sections/closing";
import { FutureMovementCoach } from "@/components/sections/coach";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} | ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Journey />
      <Assurance />
      <FutureMovementCoach />
      <Faq />
      <Closing />
    </>
  );
}
