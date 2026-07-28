import { AppleLogo, PlayStoreLogo } from "@/components/icons";
import { site } from "@/lib/site";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
  "Tell me when ParkiWell launches",
)}`;

type Tone = "light" | "canvas";

function Badge({
  logo,
  small,
  big,
  tone,
}: {
  logo: React.ReactNode;
  small: string;
  big: string;
  tone: Tone;
}) {
  const shell =
    tone === "canvas"
      ? "border-canvas-line bg-white/[0.04] hover:border-canvas-accent hover:bg-white/[0.08]"
      : "border-line-strong bg-surface shadow-card hover:border-brand hover:bg-brand-soft";
  const caption = tone === "canvas" ? "text-on-canvas-muted" : "text-subtle";
  const title = tone === "canvas" ? "text-on-canvas" : "text-ink";

  return (
    <a
      href={mailto}
      className={`group inline-flex min-h-[3.5rem] items-center gap-3.5 rounded-full border px-6 py-3 text-left transition-colors duration-200 ${shell}`}
    >
      <span className={title}>{logo}</span>
      <span className="flex flex-col leading-tight">
        <span
          className={`text-[0.6875rem] uppercase tracking-[0.12em] ${caption}`}
        >
          {small}
        </span>
        <span className={`font-display text-base font-semibold ${title}`}>
          {big}
        </span>
      </span>
    </a>
  );
}

export function StoreBadges({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Badge
        tone={tone}
        logo={<AppleLogo className="h-6 w-6" />}
        small="Coming soon to"
        big="the App Store"
      />
      <Badge
        tone={tone}
        logo={<PlayStoreLogo className="h-[1.35rem] w-[1.35rem]" />}
        small="Coming soon to"
        big="Google Play"
      />
    </div>
  );
}
