import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] items-center border-t border-line pb-20 pt-32">
      <Container width="narrow">
        <p className="mb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-strong">
          Page not found
        </p>
        <h1 className="text-[2.25rem] font-bold leading-tight sm:text-[2.75rem]">
          That page is not here
        </h1>
        <p className="measure mt-5 text-[1.0625rem] text-muted">
          The link may be old, or the address may have a typo in it. The main
          pages are all one tap away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 font-semibold text-on-brand transition-colors duration-200 hover:bg-brand-strong"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/support"
            className="inline-flex min-h-12 items-center rounded-lg border border-line-strong bg-surface px-5 font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand-strong"
          >
            Get support
          </Link>
        </div>
      </Container>
    </section>
  );
}
