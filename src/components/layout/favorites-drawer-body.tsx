"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, Share2, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LABELS, ROUTES } from "@/config/constants";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFavoriteToggle } from "@/hooks/use-favorites";
import { useFirmaId } from "@/hooks/use-firma-id";
import { accountService } from "@/services/account.service";
import { storeService } from "@/services/store.service";
import { formatPrice } from "@/lib/utils";

interface FavoritesDrawerBodyProps {
  onClose: () => void;
}

export function FavoritesDrawerBody({ onClose }: FavoritesDrawerBodyProps) {
  const user = useAuthStore((s) => s.user);
  const firmaId = useFirmaId();
  const { toggle } = useFavoriteToggle();
  const { addProduct } = useAddToCart();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: accountService.getFavorites,
    enabled: !!user,
  });

  const { data: allProducts } = useQuery({
    queryKey: ["products-for-favorites", firmaId],
    queryFn: async () => {
      const { items } = await storeService.getProducts(firmaId, { size: 100 });
      return items;
    },
    enabled: !!user && favoriteIds.length > 0,
  });

  const products = (allProducts ?? []).filter((p) => favoriteIds.includes(p.id));

  const handleShare = async () => {
    const url = `${window.location.origin}${ROUTES.favorites}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: LABELS.favorites, url });
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
          <Heart className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold tracking-tight">{LABELS.favorites}</h2>
          {products.length > 0 && (
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {products.length}
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
        {!user ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <Heart className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Favorileri görmek için giriş yapın.</p>
            <Button asChild>
              <Link href={ROUTES.login} onClick={onClose}>
                {LABELS.login}
              </Link>
            </Button>
          </div>
        ) : isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{LABELS.loading}</p>
        ) : products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <Heart className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{LABELS.emptyFavorites}</p>
            <Button onClick={onClose}>{LABELS.continueShopping}</Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {products.map((product) => {
              const hasDiscount =
                product.listeTutari != null &&
                product.satisTutari != null &&
                product.listeTutari > product.satisTutari;
              return (
                <li
                  key={product.id}
                  className="rounded-[var(--radius-card)] border border-border/70 bg-card p-3 shadow-card"
                >
                  <div className="flex gap-3">
                    <Link
                      href={ROUTES.product(product.slug ?? String(product.id))}
                      onClick={onClose}
                      className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-secondary"
                    >
                      {product.resim ? (
                        <Image src={product.resim} alt={product.isim} fill className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="size-6 opacity-40" />
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={ROUTES.product(product.slug ?? String(product.id))}
                          onClick={onClose}
                          className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary"
                        >
                          {product.isim}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(product.id, true)}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-destructive"
                          aria-label="Favorilerden çıkar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <p className="text-sm font-extrabold">{formatPrice(product.satisTutari ?? 0)}</p>
                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.listeTutari!)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={(product.stokMiktari ?? 0) <= 0}
                        onClick={() => addProduct(product)}
                      >
                        {LABELS.addToCart}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
