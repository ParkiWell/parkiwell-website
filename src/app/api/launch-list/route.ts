import { NextResponse, type NextRequest } from "next/server";
import {
  addToLaunchList,
  isConfigured,
  looksLikeAnAddress,
  normalise,
  withinRate,
} from "@/lib/launch-list";

/**
 * Adds an address to the launch list.
 *
 * Answers both a `fetch` from the form and a plain form post from a browser
 * with no JavaScript, so the list works either way.
 *
 * Every failure that is not the visitor's fault reads the same from outside.
 * In particular an address already on the list is reported as success, so this
 * endpoint cannot be used to ask whether a given person signed up.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Below this, nothing looked at the page.
 *
 * Kept short on purpose. The trap field is the real defence here; this only
 * catches a script that drives the form without pausing. A generous window
 * would start turning away real people, because a browser filling a saved
 * address in and a visitor pressing enter can be through a one field form in
 * well under a second, and being turned away here is silent by design. When
 * the two defences disagree, the one that cannot drop a real signup wins.
 */
const TOO_FAST_MS = 400;

type Submission = { email: string; trap: string; startedAt: number };

async function read(request: NextRequest): Promise<Submission | null> {
  const type = request.headers.get("content-type") ?? "";

  if (type.includes("application/json")) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== "string") return null;
    return {
      email: body.email,
      trap: typeof body.company === "string" ? body.company : "",
      startedAt: Number(body.startedAt) || 0,
    };
  }

  if (
    type.includes("application/x-www-form-urlencoded") ||
    type.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    if (!form) return null;
    return {
      email: String(form.get("email") ?? ""),
      trap: String(form.get("company") ?? ""),
      startedAt: Number(form.get("startedAt")) || 0,
    };
  }

  return null;
}

function answer(request: NextRequest, status: number, state: string) {
  const wantsJson = (request.headers.get("accept") ?? "").includes(
    "application/json",
  );
  if (wantsJson) {
    return NextResponse.json({ state }, { status });
  }
  // A form post with no JavaScript: come back to the launch list with the
  // outcome in the URL, so the page can say what happened.
  //
  // The location is relative on purpose. Rebuilding an absolute URL from the
  // request means trusting a host header behind a proxy, and it sent visitors
  // to whatever hostname the server happened to think it had rather than the
  // one they typed. A relative location is always the host they came from.
  return new NextResponse(null, {
    status: 303,
    headers: { location: `/?launch=${encodeURIComponent(state)}#get` },
  });
}

export async function POST(request: NextRequest) {
  const submission = await read(request);
  if (!submission) return answer(request, 400, "invalid");

  // A field no person can see, and a clock. Between them they turn away the
  // scripted submissions without asking a human to prove anything, which is
  // what a third party captcha would cost us.
  if (submission.trap.trim() !== "") return answer(request, 200, "ok");
  if (
    submission.startedAt > 0 &&
    Date.now() - submission.startedAt < TOO_FAST_MS
  ) {
    return answer(request, 200, "ok");
  }

  const email = normalise(submission.email);
  if (!looksLikeAnAddress(email)) return answer(request, 400, "invalid");

  const from =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!withinRate(from)) return answer(request, 429, "busy");

  if (!isConfigured()) return answer(request, 503, "unavailable");

  const outcome = await addToLaunchList(email);
  if (outcome.ok) return answer(request, 200, "ok");
  return answer(request, 503, outcome.reason);
}

export async function GET() {
  // The list is write only from out here. Say so rather than 404, which would
  // read like the endpoint is missing.
  return NextResponse.json({ state: "write-only" }, { status: 405 });
}
