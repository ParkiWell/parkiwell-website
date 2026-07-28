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

export function SiteFooter() {
  return (
    <footer data-chapter="footer" className="chapter border-t border-line text-ink">
      <Container className="py-10 sm:py-12">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-3"
            aria-label={`${site.name} home`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#12363a] shadow-card">
              <Mark className="h-8 w-8" />
            </span>
            <span>
              <span className="block font-display text-xl font-extrabold tracking-tight">
                {site.name}
              </span>
              <span className="block text-xs font-bold text-muted">
                Your care day, in rhythm
              </span>
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-extrabold text-muted">
              {links.map((link) => (
                <li key={link.href}>
                  <Link className="transition-colors hover:text-ink" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 grid gap-6 border-t border-line pt-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <p className="max-w-[68rem] text-sm font-semibold leading-relaxed text-muted">
            {legalNotice}
          </p>
          <div className="flex flex-col gap-1 text-xs font-bold text-subtle lg:text-right">
            <p>&copy; {new Date().getFullYear()} ParkiWell</p>
            <p>Made with care for the Parkinson&rsquo;s community.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
