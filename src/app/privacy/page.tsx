import { pageMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/legal-page";
import { loadLegalDocument } from "@/lib/legal";

export const metadata = pageMetadata(
  "Privacy Policy",
  "How ParkiWell handles the information you record, where it is stored, who can access it, and the choices you have.",
  "/privacy",
);

export default async function PrivacyPage() {
  const document = await loadLegalDocument("privacy");
  return <LegalPage document={document} />;
}
