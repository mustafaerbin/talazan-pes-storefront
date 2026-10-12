"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { ProductDetailView } from "@/modules/catalog/product-detail";
import { LABELS } from "@/config/constants";
import { useFirmaId } from "@/hooks/use-firma-id";
import { storeService } from "@/services/store.service";
import type { FirmaUrunDto } from "@/types/api";

interface ProductDetailDialogProps {
  product: FirmaUrunDto;
  onClose: () => void;
}

export function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  const firmaId = useFirmaId();
  const slug = product.slug ?? String(product.id);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { data, isError } = useQuery({
    queryKey: ["product", firmaId, slug],
    queryFn: () => storeService.getProductBySlug(firmaId, slug),
    placeholderData: product,
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.isim}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-4 sm:max-w-5xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Kapat"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
        {isError && !data ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{LABELS.noResults}</p>
        ) : (
          data && <ProductDetailView product={data} embedded />
        )}
      </div>
    </div>,
    document.body,
  );
}
