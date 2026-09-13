import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { site } from "@/lib/site";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path} className="text-link py-2">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: new URL(item.path, site.url).href,
          })),
        }}
      />
    </>
  );
}
