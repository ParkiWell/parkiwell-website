import Link from "next/link";
import { Mark } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { legalNotice, site } from "@/lib/site";

const links = [
  { href: "/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: `mailto:${site.email}`, label: "Contact" },
];

/**
 * One band, three things: who this is, where else to go, and the disclaimer
 * that has to be on every page. The links sit on the same line as the mark so
 * the footer reads as a single rule under the page rather than a stack of
 * little sections, and the notice runs as one sentence with the copyright
 * rather than a column of its own.
 */
export function SiteFooter() {
  return (
    <footer
      data-chapter="footer"
      className="chapter border-t border-line text-ink"
    >
      <Container className="py-9 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-3"
            aria-label={`${site.name} home`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#12363a] shadow-card">
              <Mark className="h-7 w-7" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-[-0.03em]">
              {site.name}
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-extrabold text-muted">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="transition-colors duration-200 hover:text-ink"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-7 border-t border-line pt-6 text-[0.8125rem] font-semibold leading-relaxed text-subtle">
          {legalNotice}{" "}
          <span className="whitespace-nowrap">
            &copy; {new Date().getFullYear()} {site.name}.
          </span>
        </p>
      </Container>
    </footer>
  );
}
