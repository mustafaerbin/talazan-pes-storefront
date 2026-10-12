"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTenantContext } from "@/providers/firma-id-provider";

export function useFirmaId(): number {
  const { firmaId: contextFirmaId } = useTenantContext();
  const searchParams = useSearchParams();
  return useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      const param = searchParams.get("firmaId");
      if (param && !Number.isNaN(Number(param))) {
        return Number(param);
      }
    }
    return contextFirmaId;
  }, [contextFirmaId, searchParams]);
}

export function useSiteUrl(): string {
  return useTenantContext().siteUrl;
}
