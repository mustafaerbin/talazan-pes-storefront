"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { env, resolveFirmaId } from "@/config/env";

export function useFirmaId(): number {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const param = searchParams.get("firmaId");
    if (param && !Number.isNaN(Number(param))) {
      return Number(param);
    }
    return env.firmaId;
  }, [searchParams]);
}

export function useFirmaIdFromServer(searchParams?: { firmaId?: string | string[] }): number {
  return resolveFirmaId(searchParams);
}
