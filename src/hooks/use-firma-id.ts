"use client";

import { useTenantContext } from "@/providers/firma-id-provider";

export function useFirmaId(): number {
  return useTenantContext().firmaId;
}

export function useSiteUrl(): string {
  return useTenantContext().siteUrl;
}
