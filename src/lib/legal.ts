import { readFile } from "node:fs/promises";
import path from "node:path";
import { Marked, type Tokens } from "marked";

export type LegalDocument = {
  title: string;
  effective?: string;
  updated?: string;
  html: string;
};

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Schemes a link in a legal document is allowed to point at. */
const SAFE_LINK = /^(?:https?:|mailto:|\/|#)/i;

/**
 * The rendered Markdown goes straight into `dangerouslySetInnerHTML`, so the
 * renderer is narrowed to the shapes these documents actually use:
 *
 *  - raw HTML in the source is escaped and shown, never executed, so a stray
 *    `<script>` or `onerror` attribute in a future edit is inert;
 *  - link and image targets are limited to http, https, mailto, and paths,
 *    which rules out `javascript:` and `data:` URLs.
 *
 * The files are repository controlled and no visitor input reaches this path,
 * so none of this is load bearing today. It is here so that it stays true.
 */
const renderer = {
  html({ text }: Tokens.HTML | Tokens.Tag) {
    return escapeHtml(text);
  },
  link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
    const body = this.parser.parseInline(token.tokens);
    if (!SAFE_LINK.test(token.href)) return body;
    const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
    return `<a href="${escapeHtml(token.href)}"${title}>${body}</a>`;
  },
  image(token: Tokens.Image) {
    const alt = escapeHtml(token.text ?? "");
    if (!SAFE_LINK.test(token.href)) return alt;
    return `<img src="${escapeHtml(token.href)}" alt="${alt}" />`;
  },
};

const markdown = new Marked({ gfm: true, async: true, renderer });

/**
 * These documents are maintained as Markdown alongside the app so the site and
 * the store listings never drift apart. Everything is rendered at build time
 * from repository-controlled files.
 */
export async function loadLegalDocument(
  slug: "privacy" | "terms",
): Promise<LegalDocument> {
  const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), "utf8");

  const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, "");
  const lines = withoutComments.split("\n");

  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine ? titleLine.slice(2).trim() : "";

  const effective = matchMeta(withoutComments, "Effective Date");
  const updated = matchMeta(withoutComments, "Last Updated");

  const body = withoutComments
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("# ") &&
        !/^\*\*(Effective Date|Last Updated):/.test(line.trim()),
    )
    .join("\n")
    // Repository-relative links become site routes.
    .replace(/\(PRIVACY_POLICY\.md\)/g, "(/privacy)")
    .replace(/\(TERMS_OF_SERVICE\.md\)/g, "(/terms)")
    // Bare autolinked addresses read better as plain text links.
    .replace(/<([\w.+-]+@[\w.-]+)>/g, "[$1](mailto:$1)");

  const html = await markdown.parse(body);

  return { title, effective, updated, html };
}

function matchMeta(source: string, label: string) {
  const match = source.match(
    new RegExp(`\\*\\*${label}:\\s*([^*]+)\\*\\*`, "i"),
  );
  return match?.[1]?.trim();
}
