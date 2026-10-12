import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getInternalApiBase, isLocalHost, TENANT_FIRMA_HEADER } from "@/lib/tenant-api";

const resolveCache = new Map<string, { firmaId: number; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

async function resolveFirmaIdCached(host: string): Promise<number | null> {
  const now = Date.now();
  const cached = resolveCache.get(host);
  if (cached && cached.expiresAt > now) {
    return cached.firmaId;
  }

  const base = getInternalApiBase();
  const response = await fetch(`${base}/public/store/resolve?host=${encodeURIComponent(host)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as { data?: { firmaId?: number } };
  const firmaId = body.data?.firmaId;
  if (typeof firmaId !== "number") {
    return null;
  }
  resolveCache.set(host, { firmaId, expiresAt: now + CACHE_TTL_MS });
  return firmaId;
}

export async function middleware(request: NextRequest) {
  const rawHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const hostWithPort = rawHost.split(",")[0]?.trim().toLowerCase() ?? "";
  const hostOnly = hostWithPort.split(":")[0] ?? "";

  if (hostOnly.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = hostOnly.slice(4);
    return NextResponse.redirect(url, 301);
  }

  let firmaId: number | null = null;
  if (isLocalHost(hostOnly)) {
    firmaId = Number(process.env.NEXT_PUBLIC_FIRMA_ID ?? "1");
  } else {
    firmaId = await resolveFirmaIdCached(hostWithPort || hostOnly);
    if (firmaId == null) {
      return new NextResponse("Magaza bulunamadi", { status: 404 });
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_FIRMA_HEADER, String(firmaId));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
