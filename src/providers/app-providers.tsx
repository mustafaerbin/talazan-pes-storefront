"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore, useOrdersStore } from "@/hooks/use-auth-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { SidePanel } from "@/components/layout/side-panel";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    void useCartStore.persist.rehydrate();
    void useOrdersStore.persist.rehydrate();
  }, [hydrate]);

  return (
    <>
      {children}
      <SidePanel />
      <Toaster richColors position="top-center" />
    </>
  );
}
