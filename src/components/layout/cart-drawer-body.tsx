"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Share2, ShoppingCart, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LABELS, ROUTES } from "@/config/constants";
import { useCartStore } from "@/hooks/use-cart-store";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/api";

const FREE_SHIPPING_THRESHOLD = 1500;

interface CartDrawerBodyProps {
  onClose: () => void;
}

function variantLine(item: CartItem): string | null {
  const parts: string[] = [];
  if (item.renk) parts.push(`RENK: ${item.renk.toUpperCase()}`);
  if (item.beden) parts.push(`BEDEN: ${item.beden.toUpperCase()}`);
  return parts.length ? parts.join(" / ") : null;
}

export function CartDrawerBody({ onClose }: CartDrawerBodyProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const itemCount = items.reduce((sum, i) => sum + i.adet, 0);
  const subtotal = items.reduce((sum, i) => sum + i.birimFiyat * i.adet, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleShare = async () => {
    const url = `${window.location.origin}${ROUTES.cart}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sepetim", url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <ShoppingCart className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold tracking-tight">Sepetim</h2>
          {itemCount > 0 && (
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/15"
            onClick={handleShare}
            aria-label="Paylaş"
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/15"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X className="size-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <ShoppingCart className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{LABELS.emptyCart}</p>
            <Button asChild>
              <Link href={ROUTES.home} onClick={onClose}>
                {LABELS.continueShopping}
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const hasDiscount =
                item.listeTutari != null && item.listeTutari > item.birimFiyat;
              const percent = hasDiscount
                ? Math.round(((item.listeTutari! - item.birimFiyat) / item.listeTutari!) * 100)
                : 0;
              const lowStock = (item.stokMiktari ?? 0) > 0 && (item.stokMiktari ?? 0) <= 5;
              const variant = variantLine(item);
              return (
                <li
                  key={item.urunId}
                  className="rounded-[var(--radius-card)] border border-border/70 bg-card p-3 shadow-card"
                >
                  <div className="flex gap-3">
                    <Link
                      href={ROUTES.product(item.slug ?? String(item.urunId))}
                      onClick={onClose}
                      className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-secondary"
                    >
                      {item.resim ? (
                        <Image src={item.resim} alt={item.isim} fill className="object-cover" />
                      ) : null}
                      {hasDiscount && (
                        <span className="absolute bottom-1 left-1 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-white">
                          %{percent} indirim
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={ROUTES.product(item.slug ?? String(item.urunId))}
                          onClick={onClose}
                          className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary"
                        >
                          {item.isim}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.urunId)}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-destructive"
                          aria-label="Kaldır"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {variant && (
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {variant}
                        </p>
                      )}
                      {lowStock && (
                        <p className="mt-1.5 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                          Stokta son {item.stokMiktari} adet kaldı
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex h-9 items-center rounded-full border border-border px-1">
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-secondary"
                        onClick={() => updateQuantity(item.urunId, item.adet - 1)}
                        aria-label="Azalt"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.adet}</span>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-secondary"
                        onClick={() => updateQuantity(item.urunId, item.adet + 1)}
                        aria-label="Artır"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      {hasDiscount && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.listeTutari! * item.adet)}
                        </p>
                      )}
                      <p className={hasDiscount ? "text-sm font-extrabold text-destructive" : "text-sm font-extrabold"}>
                        {formatPrice(item.birimFiyat * item.adet)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <footer className="border-t border-border bg-card">
          <div className="border-b border-primary/15 bg-primary/5 px-5 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-foreground/80">
              <Truck className="size-4 text-primary" />
              {remainingForFreeShipping > 0
                ? `${formatPrice(remainingForFreeShipping)} daha ekleyin, kargo bedava`
                : "Kargonuz ücretsiz"}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="relative flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Toplam</p>
              <p className="text-lg font-extrabold leading-none">{formatPrice(subtotal)}</p>
            </div>
            <Button size="lg" className="shrink-0 font-bold" asChild>
              <Link href={ROUTES.checkout} onClick={onClose}>
                {LABELS.proceedToCheckout}
              </Link>
            </Button>
          </div>
        </footer>
      )}
    </>
  );
}
