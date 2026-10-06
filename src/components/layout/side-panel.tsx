"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { CartDrawerBody } from "@/components/layout/cart-drawer-body";
import { FavoritesDrawerBody } from "@/components/layout/favorites-drawer-body";

export function SidePanel() {
  const mode = useSidePanelStore((s) => s.mode);
  const close = useSidePanelStore((s) => s.close);

  useEffect(() => {
    if (!mode) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mode, close]);

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            aria-label="Paneli kapat"
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-background shadow-hover"
          >
            {mode === "cart" ? <CartDrawerBody onClose={close} /> : <FavoritesDrawerBody onClose={close} />}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
