import { Container } from "@/components/ui/container";
import type { LegalDocument } from "@/lib/legal";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <article className="min-h-[100svh] border-t border-line pb-20 pt-32 sm:pt-36">
      <Container width="narrow">
        <h1 className="text-[2rem] font-bold leading-tight sm:text-[2.5rem]">
          {document.title}
        </h1>
        {(document.effective || document.updated) && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-[0.9375rem] text-subtle">
            {document.effective && (
              <div className="flex gap-2">
                <dt className="font-semibold text-muted">Effective</dt>
                <dd>{document.effective}</dd>
              </div>
            )}
            {document.updated && (
              <div className="flex gap-2">
                <dt className="font-semibold text-muted">Last updated</dt>
                <dd>{document.updated}</dd>
              </div>
            )}
          </dl>
        )}
        <div
          className="prose-legal mt-10"
          dangerouslySetInnerHTML={{ __html: document.html }}
        />
      </Container>
    </article>
  );
}
