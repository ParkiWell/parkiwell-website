import Image from "next/image";
import type { ReactNode } from "react";
import type { Screen } from "@/lib/screens";

export const PHONE_ASPECT = 680 / 1477;

/**
 * Hardware frame for app screenshots. The frame is drawn with tokens rather
 * than an image asset so it stays crisp and themes correctly.
 */
export function PhoneFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`phone-frame relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2.6rem] ring-1 ring-inset ring-white/20"
      />
      <div className="relative overflow-hidden rounded-[2.15rem] bg-surface-2">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-10 h-[1.25rem] w-[34%] -translate-x-1/2 rounded-b-2xl bg-[#20363a]"
        />
        {children}
      </div>
    </div>
  );
}

export function PhoneScreen({
  src,
  alt,
  eager = false,
  urgent = false,
  sizes = "(max-width: 767px) 74vw, 340px",
  className = "",
}: {
  src: string;
  alt: string;
  eager?: boolean;
  urgent?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={680}
      height={1477}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={urgent ? "high" : undefined}
      sizes={sizes}
      className={`block h-auto w-full ${className}`}
    />
  );
}

/**
 * A screenshot that follows the theme.
 *
 * The theme lives in a `data-theme` attribute the visitor can toggle rather
 * than in a media query a `<picture>` could switch on. Both local files load
 * eagerly and occupy the same pixels, so a theme change crossfades between
 * decoded images without exposing the phone canvas underneath.
 */
export function ThemedPhoneScreen({
  screen,
  alt,
  priority = false,
  sizes,
  className = "",
}: {
  screen: Screen;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-[#f1f4fb] dark:bg-[#070b15]">
      <div className="relative z-[1] opacity-100 transition-opacity duration-300 ease-out dark:opacity-0">
        <PhoneScreen
          src={screen.light}
          alt={alt}
          eager
          urgent={priority}
          sizes={sizes}
          className={className}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] opacity-0 transition-opacity duration-300 ease-out dark:opacity-100"
      >
        <PhoneScreen
          src={screen.dark}
          alt=""
          eager
          urgent={priority}
          sizes={sizes}
          className={className}
        />
      </div>
    </div>
  );
}
