"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check } from "@/components/icons";
import { site } from "@/lib/site";

export const launchSubject = "Tell me when ParkiWell launches";
export const launchMail = `mailto:${site.email}?subject=${encodeURIComponent(
  launchSubject,
)}`;

type State = "idle" | "sending" | "done" | "invalid" | "busy" | "unavailable";

const messages: Record<Exclude<State, "idle" | "sending" | "done">, string> = {
  invalid: "That address does not look quite right. Check it and try again.",
  busy: "That is a few tries in a row. Give it a minute and try again.",
  unavailable: `Something went wrong at our end. Email ${site.email} and we will add you by hand.`,
};

/**
 * The launch list.
 *
 * A real form, posting to this origin. It works three ways on purpose: with
 * JavaScript it submits in place, without JavaScript the browser posts the form
 * and comes back to this section with the outcome in the query string, and if
 * the list is down entirely the email address underneath still reaches a person.
 * A launch list that quietly drops addresses is worse than one that admits it.
 */
/**
 * A form posted without JavaScript comes back to `/?launch=...#get`, so the
 * outcome has to be read off the URL. It is read through
 * `useSyncExternalStore` rather than in an effect: the server cannot know the
 * query string, and this is the supported way to render something it cannot,
 * without the markup disagreeing at hydration. See `useStillness` for what
 * that disagreement costs.
 */
const urlOutcome = (): State => {
  const outcome = new URLSearchParams(window.location.search).get("launch");
  if (outcome === "ok") return "done";
  if (outcome && outcome in messages) return outcome as State;
  return "idle";
};

/** The query string cannot change without a navigation, so there is nothing
 * to subscribe to. */
const subscribeToNothing = () => () => {};

export function LaunchList({ className = "" }: { className?: string }) {
  const returned = useSyncExternalStore(
    subscribeToNothing,
    urlOutcome,
    () => "idle" as State,
  );
  const [submitted, setSubmitted] = useState<State | null>(null);
  const state = submitted ?? returned;
  const setState = setSubmitted;
  const fieldId = useId();
  // Only the scripted path can report this. A form posted without JavaScript
  // sends no timestamp and skips the timing check, which is why the hidden
  // field is the trap rather than the clock: the trap works either way.
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    try {
      const response = await fetch("/api/launch-list", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          company: String(data.get("company") ?? ""),
          startedAt: openedAt.current,
        }),
      });
      const body = await response.json().catch(() => ({ state: "unavailable" }));
      setState(body.state === "ok" ? "done" : (body.state as State));
      if (body.state === "ok") form.reset();
    } catch {
      setState("unavailable");
    }
  }

  if (state === "done") {
    return (
      <div className={className}>
        <p className="flex items-center gap-3 text-[1.15rem] font-extrabold text-ink">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-bg">
            <Check className="h-5 w-5" />
          </span>
          You are on the list.
        </p>
        <p className="mt-3 max-w-[30rem] text-[0.95rem] font-semibold text-ink/70">
          We will write once, when ParkiWell reaches the App Store and Google
          Play. Nothing else.
        </p>
      </div>
    );
  }

  const failed = state !== "idle" && state !== "sending";

  return (
    <div className={className}>
      <form
        action="/api/launch-list"
        method="post"
        onSubmit={submit}
        noValidate
        className="flex w-full max-w-[34rem] flex-col gap-3 sm:flex-row"
      >
        <label htmlFor={fieldId} className="sr-only">
          Your email address
        </label>
        <input
          id={fieldId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={failed ? `${fieldId}-note` : undefined}
          aria-invalid={state === "invalid" || undefined}
          className="min-h-14 flex-1 rounded-full border border-ink/20 bg-surface px-6 text-[1.02rem] font-semibold text-ink placeholder:text-ink/40"
        />
        {/* Not shown to anyone, and not announced. Only a script fills it in. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-ink px-7 font-extrabold text-bg shadow-raised transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
        >
          {state === "sending" ? "Adding you" : "Join the launch list"}
          <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </form>

      <p
        id={`${fieldId}-note`}
        role={failed ? "alert" : undefined}
        className="mt-4 max-w-[34rem] text-[0.9rem] font-semibold text-ink/70"
      >
        {failed ? (
          messages[state as keyof typeof messages]
        ) : (
          <>
            One email, when it launches. Or write to{" "}
            <a
              href={launchMail}
              className="font-extrabold text-ink underline underline-offset-4"
            >
              {site.email}
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
