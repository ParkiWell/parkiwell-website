import type { CSSProperties } from "react";

/** A torus drawn from cross-sections in real CSS perspective space. */
export function OrbitSculpture({ className = "" }: { className?: string }) {
  return (
    <div className={`orbit-sculpture ${className}`} aria-hidden="true">
      <div className="orbit-sculpture__geometry">
        {Array.from({ length: 48 }, (_, index) => (
          <span
            key={index}
            className="orbit-sculpture__ring"
            style={{ "--ring-angle": `${index * 7.5}deg` } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
