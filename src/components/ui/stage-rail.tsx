export function StageRail({
  count,
  active,
  className = "",
  tone = "light",
}: {
  count: number;
  active: number;
  className?: string;
  tone?: "light" | "canvas";
}) {
  const on = tone === "canvas" ? "bg-canvas-accent" : "bg-brand";
  const off = tone === "canvas" ? "bg-canvas-line" : "bg-line-strong";

  return (
    <ol aria-hidden="true" className={`flex items-center gap-2.5 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <span
            className={`block h-[3px] rounded-full transition-all duration-700 ease-out ${
              index === active ? `w-12 ${on}` : `w-5 ${off}`
            }`}
          />
        </li>
      ))}
    </ol>
  );
}
