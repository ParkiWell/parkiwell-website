import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { loadLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The agreement covering your use of ParkiWell, including the medical disclaimer, account rules, and community guidelines.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const document = await loadLegalDocument("terms");
  return <LegalPage document={document} />;
}
