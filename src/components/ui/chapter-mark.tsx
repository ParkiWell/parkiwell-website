/** The small "01 / Title" line that opens every chapter. */
export function ChapterMark({
  index,
  title,
  tone = "light",
}: {
  index: string;
  title: string;
  tone?: "light" | "canvas";
}) {
  const rule = tone === "canvas" ? "bg-canvas-line" : "bg-line-strong";
  const number = tone === "canvas" ? "text-canvas-accent" : "text-brand-strong";
  const label = tone === "canvas" ? "text-on-canvas-muted" : "text-subtle";

  return (
    <div className="flex items-center gap-4">
      <span className={`numeral text-[0.9375rem] ${number}`}>{index}</span>
      <span aria-hidden="true" className={`h-px w-10 ${rule}`} />
      <span className={`label ${label}`}>{title}</span>
    </div>
  );
}
