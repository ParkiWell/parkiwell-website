"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy } from "@/components/icons";
import { site } from "@/lib/site";

export const launchSubject = "Tell me when ParkiWell launches";
export const launchMail = `mailto:${site.email}?subject=${encodeURIComponent(
  launchSubject,
)}`;

type Copied = "idle" | "done" | "failed";

/**
 * The launch list.
 *
 * There is no signup form behind this yet, so the whole thing is one email
 * address. A `mailto:` link is the fast path, but plenty of people have no mail
 * client wired up and a `mailto:` that goes nowhere looks like a broken button.
 * So the address is always on the page as selectable text, with a copy button
 * beside it. Every route to the list works without JavaScript except the copy
 * button, which is the only part that is purely a convenience.
 */
export function LaunchList({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState<Copied>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied("done");
    } catch {
      // Blocked by the browser or unavailable outside a secure context. The
      // address is on screen either way, so say so rather than failing silently.
      setCopied("failed");
    }
    timer.current = setTimeout(() => setCopied("idle"), 4000);
  }, []);

  return (
    <div className={className}>
      <a
        href={launchMail}
        className="group inline-flex min-h-16 items-center gap-4 rounded-full bg-ink px-8 font-extrabold text-bg shadow-raised transition-transform duration-300 hover:-translate-y-0.5"
      >
        Tell me when it launches
        <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
      </a>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem] font-bold">
        <span className="text-ink/70">Or write to</span>
        <a
          href={`mailto:${site.email}`}
          className="rounded-lg font-extrabold text-ink underline underline-offset-4"
        >
          {site.email}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-4 text-[0.9rem] font-extrabold text-ink transition-colors duration-200 hover:bg-ink/5"
        >
          {copied === "done" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied === "done" ? "Copied" : "Copy address"}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied === "done"
            ? `${site.email} copied to the clipboard`
            : copied === "failed"
              ? "Copying is not available in this browser. The address is shown on the page."
              : ""}
        </span>
      </div>

      {copied === "failed" && (
        <p className="mt-3 text-[0.9rem] font-semibold text-ink/70">
          This browser would not let us copy for you. The address above can be
          selected by hand.
        </p>
      )}
    </div>
  );
}
