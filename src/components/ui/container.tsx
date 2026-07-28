import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow";
}) {
  const max = width === "narrow" ? "max-w-3xl" : "max-w-[90rem]";
  return (
    <div className={`mx-auto w-full ${max} px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
