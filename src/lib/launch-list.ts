import "server-only";

/**
 * The launch list.
 *
 * The browser never talks to Supabase. It posts to this origin, the server adds
 * the key, and the row goes in from there. That keeps the site's promise that
 * it makes no third party requests literally true, and it keeps the key out of
 * the bundle. The key is the anon one either way, in its legacy JWT form or
 * the newer publishable form, and the policies in `supabase/launch_list.sql`
 * let that role insert and nothing else.
 */

export type Outcome =
  | { ok: true }
  | { ok: false; reason: "invalid" | "busy" | "unavailable" };

const ENDPOINT = "/rest/v1/launch_list";

/**
 * Deliberately loose. The job is to catch a typo and a paste of something that
 * is plainly not an address, not to adjudicate RFC 5322: every clever address
 * regex on the internet rejects somebody's real email.
 */
const PLAUSIBLE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalise(email: string) {
  return email.trim().toLowerCase();
}

export function looksLikeAnAddress(email: string) {
  return email.length >= 6 && email.length <= 254 && PLAUSIBLE.test(email);
}

/**
 * A small sliding window, per address of origin.
 *
 * This is a speed bump, not a wall. Serverless instances come and go, so the
 * counter is not shared or durable, and anything determined gets past it. The
 * durable protections are the unique index, which makes repeats free, and the
 * platform firewall, which is where a real rate limit belongs.
 */
const WINDOW_MS = 60_000;
const PER_WINDOW = 5;
const recent = new Map<string, number[]>();

export function withinRate(key: string, now = Date.now()) {
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);

  // Keep the map from growing without bound on a long lived instance.
  if (recent.size > 5000) {
    for (const [id, times] of recent) {
      if (times.every((at) => now - at >= WINDOW_MS)) recent.delete(id);
    }
  }

  return hits.length <= PER_WINDOW;
}

export function isConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function addToLaunchList(email: string): Promise<Outcome> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, reason: "unavailable" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const headers: Record<string, string> = {
      apikey: key,
      "content-type": "application/json",
      // Nothing needs to come back.
      //
      // Notably absent: `resolution=ignore-duplicates`. That would be the
      // tidy way to let a repeat signup pass, but it compiles to ON CONFLICT,
      // which Postgres will only run for a role that can also SELECT the
      // table. Buying it would mean granting the anon role read access to the
      // whole launch list and leaning on row level security alone to take it
      // back. The duplicate is handled below instead, and the key stays
      // able to do exactly one thing.
      prefer: "return=minimal",
    };
    // A legacy anon key is a JWT, and PostgREST reads the role out of it, so
    // it travels as the bearer token too. A publishable key (sb_publishable_)
    // is not a JWT. Supabase documents it as unsupported in the Authorization
    // header and reads the role from the apikey header, so it goes there only.
    if (!key.startsWith("sb_")) headers.authorization = `Bearer ${key}`;

    const response = await fetch(`${url.replace(/\/+$/, "")}${ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, source: "site" }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.ok) return { ok: true };

    // Already on the list. That is a success, and it has to be reported as one:
    // the visitor is careful, not wrong, and a different answer here would turn
    // the form into a way to ask whether a given address had signed up. Only
    // this server ever sees the conflict.
    const body = await response.text().catch(() => "");
    if (response.status === 409 || body.includes("23505")) return { ok: true };

    console.error(`launch list insert failed: ${response.status} ${body}`);
    return { ok: false, reason: "unavailable" };
  } catch (error) {
    console.error("launch list insert threw", error);
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
