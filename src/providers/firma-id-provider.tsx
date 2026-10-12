"use client";

import { createContext, useContext } from "react";

export type TenantContextValue = {
  firmaId: number;
  siteUrl: string;
};

const TenantContext = createContext<TenantContextValue>({
  firmaId: 1,
  siteUrl: "http://localhost:3000",
});

export function FirmaIdProvider({
  firmaId,
  siteUrl,
  children,
}: {
  firmaId: number;
  siteUrl: string;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={{ firmaId, siteUrl }}>{children}</TenantContext.Provider>;
}

export function useTenantContext(): TenantContextValue {
  return useContext(TenantContext);
}
