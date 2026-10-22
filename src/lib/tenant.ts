import { headers } from "next/headers";
import { getInternalApiBase, isLocalHost, TENANT_FIRMA_HEADER } from "@/lib/tenant-api";

export { TENANT_FIRMA_HEADER, getInternalApiBase, isLocalHost };

export async function resolveFirmaId(searchParams?: {
  firmaId?: string | string[];
}): Promise<number> {
  const h = await headers();
  const fromHeader = h.get(TENANT_FIRMA_HEADER);
  if (fromHeader && !Number.isNaN(Number(fromHeader))) {
    return Number(fromHeader);
  }

  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const hostOnly = host.split(":")[0] ?? "";

  if (isLocalHost(hostOnly) || process.env.NODE_ENV === "development" || !hostOnly) {
    const param = searchParams?.firmaId;
    const value = Array.isArray(param) ? param[0] : param;
    if (value && !Number.isNaN(Number(value))) {
      return Number(value);
    }
    return Number(process.env.NEXT_PUBLIC_FIRMA_ID ?? "1");
  }

  const resolved = await resolveFirmaIdForHost(host);
  if (resolved == null) {
    throw new Error("Magaza bulunamadi");
  }
  return resolved;
}

export async function getRequestSiteUrl(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim();
  if (!host) {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }
  const hostOnly = host.split(":")[0] ?? "";
  if (isLocalHost(hostOnly)) {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${hostOnly}`;
}

export async function resolveFirmaIdForHost(hostHeader: string): Promise<number | null> {
  const host = hostHeader.split(",")[0]?.trim();
  if (!host || isLocalHost(host.split(":")[0] ?? "")) {
    return Number(process.env.NEXT_PUBLIC_FIRMA_ID ?? "1");
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
  return typeof firmaId === "number" ? firmaId : null;
}
