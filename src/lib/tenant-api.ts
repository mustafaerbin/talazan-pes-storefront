/** Edge/middleware-safe helpers (no next/headers). */

export const TENANT_FIRMA_HEADER = "x-firma-id";

export function getInternalApiBase(): string {
  const raw =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8080/api";
  return raw.replace("://localhost", "://127.0.0.1").replace(/\/+$/, "");
}

export function isLocalHost(host: string): boolean {
  const h = host.split(":")[0]?.trim().toLowerCase() ?? "";
  return h === "localhost" || h === "127.0.0.1";
}
