"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Close, Mark, Menu, Moon, Sun } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { nav, site } from "@/lib/site";

type Theme = "light" | "dark";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * Links into a chapter of the home page are plain anchors, not `Link`.
 *
 * The browser already does the right thing with both cases: from the home page
 * `/#get` is a same document fragment jump with no reload, and from anywhere
 * else it is an ordinary navigation that lands on the anchor. Routing it
 * through `Link` instead means the client router owns the hash, and it drops it
 * on a cross page jump, so the visitor arrives at the top of the home page
 * having asked for the launch list. Anchors also stop the router prefetching
 * the home page three times over from the home page itself.
 */
export function SiteHeader() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readTheme,
    () => "light" as Theme,
  );
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 24,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pw-theme", next);
    } catch {
      // The selected theme still applies when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousLock = root.dataset.scrollLocked;
    root.style.overflow = "hidden";
    root.dataset.scrollLocked = "true";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previousOverflow;
      if (previousLock === undefined) delete root.dataset.scrollLocked;
      else root.dataset.scrollLocked = previousLock;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  // The bar stays put. A header that hides and returns as you travel reads as
  // one more thing moving on a page that already moves, so this one is simply
  // always where you left it.
  return (
    <header className="header-enter pointer-events-none fixed inset-x-0 top-3 z-40 sm:top-4">
      <Container>
        <div
          className={`pointer-events-auto overflow-hidden ${open ? "rounded-[1.5rem]" : "rounded-full"} border border-ink/10 bg-bg-veil backdrop-blur-xl transition-shadow duration-500 ${
            scrolled || open ? "shadow-card" : "shadow-none"
          }`}
        >
          <div className="flex h-[4.15rem] items-center justify-between gap-4 px-3 sm:px-4">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl pr-2"
              aria-label={`${site.name} home`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink">
                <Mark className="h-7 w-7" />
              </span>
              <span className="font-display text-[1.18rem] font-bold tracking-[-0.045em] text-ink">
                {site.name}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Primary"
            >
              {[...nav, { href: "/#questions", label: "Questions" }].map(
                (item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-[0.9rem] font-bold text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Use light theme" : "Use dark theme"
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* eslint-disable-next-line @next/next/no-html-link-for-pages
                  -- a plain anchor is what keeps the fragment, see above */}
              <a
                href="/#get"
                className="hidden min-h-11 items-center rounded-full bg-ink px-5 text-[0.9rem] font-extrabold text-bg transition-transform duration-200 hover:-translate-y-0.5 sm:inline-flex"
              >
                Join the launch list
              </a>

              <button
                ref={menuButton}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-on-brand lg:hidden"
              >
                {open ? (
                  <Close className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div
            id="mobile-nav"
            hidden={!open}
            className="border-t border-line px-3 pb-3 lg:hidden"
          >
            <nav className="flex flex-col pt-3" aria-label="Primary, mobile">
              {[
                ...nav,
                { href: "/#questions", label: "Questions" },
                { href: "/support", label: "Support" },
              ].map((item, index) => {
                const Tag = item.href.includes("#") ? "a" : Link;
                return (
                  <Tag
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-xl px-3 font-display text-lg font-bold text-ink hover:bg-surface-2"
                  >
                    {item.label}
                    <span className="text-xs text-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Tag>
                );
              })}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages
                  -- a plain anchor is what keeps the fragment, see above */}
              <a
                href="/#get"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 font-extrabold text-on-brand"
              >
                Join the launch list
              </a>
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
