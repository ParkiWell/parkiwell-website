import { pageMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/legal-page";
import { loadLegalDocument } from "@/lib/legal";

export const metadata = pageMetadata(
  "Terms of Service",
  "The agreement covering your use of ParkiWell, including the medical disclaimer, account rules, and community guidelines.",
  "/terms",
);

export default async function TermsPage() {
  const document = await loadLegalDocument("terms");
  return <LegalPage document={document} />;
}
