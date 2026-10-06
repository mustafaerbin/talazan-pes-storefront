const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const env = {
  // Sunucu tarafında localhost IPv6 (::1) denemesine düşüp boş AggregateError üretiyor.
  apiUrl:
    typeof window === "undefined" ? rawApiUrl.replace("://localhost", "://127.0.0.1") : rawApiUrl,
  firmaId: Number(process.env.NEXT_PUBLIC_FIRMA_ID ?? "1"),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function resolveFirmaId(searchParams?: { firmaId?: string | string[] }): number {
  const param = searchParams?.firmaId;
  const value = Array.isArray(param) ? param[0] : param;
  if (value && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return env.firmaId;
}
