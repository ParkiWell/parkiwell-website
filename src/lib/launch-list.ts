import "server-only";

/**
 * The launch list.
 *
 * The browser never talks to Supabase. It posts to this origin, the server adds
 * the key, and the row goes in from there. That keeps the site's promise that
 * it makes no third party requests literally true, and it keeps the key out of
 * the bundle. The key is the anon one either way, and the policies in
 * `supabase/launch_list.sql` let that role insert and nothing else.
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
    const response = await fetch(`${url.replace(/\/+$/, "")}${ENDPOINT}`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        // Nothing comes back, and an address already on the list is a success
        // rather than a conflict. Both of those are on purpose: the response
        // must not differ for an address that is already signed up, or it
        // becomes a way to ask whether someone is.
        prefer: "return=minimal,resolution=ignore-duplicates",
      },
      body: JSON.stringify({ email, source: "site" }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.ok) return { ok: true };

    console.error(
      `launch list insert failed: ${response.status} ${await response
        .text()
        .catch(() => "")}`,
    );
    return { ok: false, reason: "unavailable" };
  } catch (error) {
    console.error("launch list insert threw", error);
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
