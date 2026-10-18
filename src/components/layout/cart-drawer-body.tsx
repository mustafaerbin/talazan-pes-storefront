"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LABELS, ROUTES } from "@/config/constants";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/hooks/use-cart-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { storeService } from "@/services/store.service";
import { shippingMessage } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/api";

interface CartDrawerBodyProps {
  onClose: () => void;
}

function variantLine(item: CartItem): string | null {
  const parts: string[] = [];
  if (item.renk) parts.push(item.renk);
  if (item.beden) parts.push(item.beden);
  return parts.length ? parts.join(" / ") : null;
}

export function CartDrawerBody({ onClose }: CartDrawerBodyProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const itemCount = items.reduce((sum, i) => sum + i.adet, 0);
  const subtotal = items.reduce((sum, i) => sum + i.birimFiyat * i.adet, 0);
  const firmaId = useFirmaId();
  const { data: config } = useQuery({
    queryKey: ["store-config", firmaId],
    queryFn: () => storeService.getConfig(firmaId),
  });
  const standardFee = config?.kargoUcreti ?? 0;
  const threshold = config?.ucretsizKargoLimiti ?? 0;

  return (
    <>
      <header className="flex items-start justify-between px-5 py-5">
        <div>
          <h2 className="text-lg font-semibold">Sepetim {itemCount > 0 ? `(${itemCount})` : ""}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length ? "Seçtiğiniz ürünler" : LABELS.emptyCart}
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Kapat">
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{LABELS.emptyCart}</p>
            <Button asChild>
              <Link href={ROUTES.home} onClick={onClose}>
                {LABELS.continueShopping}
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const variant = variantLine(item);
              return (
                <li key={item.urunId} className="flex gap-3 py-4">
                  <Link
                    href={ROUTES.product(item.slug ?? String(item.urunId))}
                    onClick={onClose}
                    className="relative size-16 shrink-0 overflow-hidden bg-secondary"
                  >
                    {item.resim ? (
                      <Image src={item.resim} alt={item.isim} fill sizes="64px" className="object-cover" />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={ROUTES.product(item.slug ?? String(item.urunId))}
                        onClick={onClose}
                        className="line-clamp-2 text-sm font-medium leading-snug"
                      >
                        {item.isim}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.urunId)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Kaldır"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {variant && <p className="mt-1 text-xs text-muted-foreground">{variant}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatPrice(item.birimFiyat)}</p>
                      <div className="flex h-8 items-center border border-border">
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center"
                          onClick={() => updateQuantity(item.urunId, item.adet - 1)}
                          aria-label="Azalt"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.adet}</span>
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center"
                          onClick={() => updateQuantity(item.urunId, item.adet + 1)}
                          aria-label="Artır"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <footer className="space-y-3 border-t border-border px-5 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{LABELS.subtotal}</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {shippingMessage(subtotal, threshold, standardFee)}
          </p>
          <Button size="lg" className="h-12 w-full" asChild>
            <Link href={ROUTES.checkout} onClick={onClose}>
              {LABELS.proceedToCheckout}
            </Link>
          </Button>
          <button type="button" className="w-full py-1 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
            {LABELS.continueShopping}
          </button>
        </footer>
      )}
    </>
  );
}
