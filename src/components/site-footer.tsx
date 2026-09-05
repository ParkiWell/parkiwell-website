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

/** Brand sign-off, navigation, and the site-wide legal notice. */
export function SiteFooter() {
  return (
    <footer
      data-chapter="footer"
      className="chapter border-t border-line text-ink"
    >
      <Container className="pb-9 pt-12 sm:pb-10 sm:pt-16">
        <div className="footer-wordmark" aria-hidden="true">
          ParkiWell
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-3"
            aria-label={`${site.name} home`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink">
              <Mark className="h-7 w-7" />
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-extrabold text-muted">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-ink"
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
