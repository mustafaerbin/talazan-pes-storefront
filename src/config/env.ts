import { getInternalApiBase } from "@/lib/tenant-api";

function serverApiUrl(): string {
  return getInternalApiBase();
}

export const env = {
  get apiUrl(): string {
    if (typeof window !== "undefined") {
      return "/api";
    }
    return serverApiUrl();
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
