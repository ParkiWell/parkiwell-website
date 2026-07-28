import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { loadLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ParkiWell handles the information you record, where it is stored, who can access it, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const document = await loadLegalDocument("privacy");
  return <LegalPage document={document} />;
}
