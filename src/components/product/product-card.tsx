"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Heart, ImageOff, Truck } from "lucide-react";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { Button } from "@/components/ui/button";
import { LABELS } from "@/config/constants";
import { useFirmaId } from "@/hooks/use-firma-id";
import { isFreeShipping } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import { storeService } from "@/services/store.service";
import type { FirmaUrunDto } from "@/types/api";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: FirmaUrunDto;
  onAddToCart?: (product: FirmaUrunDto) => void;
  onToggleFavorite?: (product: FirmaUrunDto) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
  highlight?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  highlight = false,
}: ProductCardProps) {
  const inStock = (product.stokMiktari ?? 0) > 0;
  const sale = product.satisTutari;
  const list = product.listeTutari;
  const hasDiscount = list != null && sale != null && list > sale && list > 0;
  const discountPercent = hasDiscount ? Math.round(((list - sale) / list) * 100) : 0;
  const images = useMemo(() => {
    const listImages = product.resimler?.filter(Boolean) ?? [];
    if (listImages.length > 0) return listImages;
    return product.resim ? [product.resim] : [];
  }, [product.resim, product.resimler]);
  const cover = images[0];
  const [detailOpen, setDetailOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const cartLock = useRef(false);
  const firmaId = useFirmaId();
  const { data: storeConfig } = useQuery({
    queryKey: ["store-config", firmaId],
    queryFn: () => storeService.getConfig(firmaId),
    staleTime: 5 * 60 * 1000,
  });
  const showFreeShipping =
    sale != null &&
    storeConfig != null &&
    isFreeShipping(sale, storeConfig.ucretsizKargoLimiti, storeConfig.kargoUcreti);

  useEffect(() => {
    setImageFailed(false);
  }, [cover]);

  useEffect(() => {
    if (cartState !== "success" && cartState !== "error") return;
    const timer = window.setTimeout(() => {
      cartLock.current = false;
      setCartState("idle");
    }, cartState === "success" ? 1200 : 1600);
    return () => window.clearTimeout(timer);
  }, [cartState]);

  const addToCart = () => {
    if (!onAddToCart || !inStock || cartLock.current) return;
    cartLock.current = true;
    setCartState("loading");
    window.setTimeout(() => {
      try {
        onAddToCart(product);
        setCartState("success");
      } catch {
        setCartState("error");
      }
    }, 0);
  };

  const cartLabel = !inStock
    ? LABELS.outOfStock
    : cartState === "loading"
      ? LABELS.loading
      : cartState === "success"
        ? "Sepete eklendi"
        : cartState === "error"
          ? "Eklenemedi"
          : LABELS.addToCart;

  return (
    <article
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card",
        highlight && "ring-1 ring-primary/20",
      )}
    >
      <div className="relative aspect-square w-full shrink-0 bg-white">
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          aria-label={product.isim}
          className="absolute inset-0 cursor-pointer border-0 bg-transparent p-0"
        >
          {cover && !imageFailed ? (
            <Image
              src={cover}
              alt=""
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8 opacity-40" />
            </span>
          )}
        </button>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {hasDiscount && (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
              %{discountPercent}
            </span>
          )}
          {!inStock && (
            <span className="rounded-md bg-foreground/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {LABELS.outOfStock}
            </span>
          )}
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-white text-foreground"
            onClick={() => onToggleFavorite(product)}
            aria-label={LABELS.favorites}
            aria-pressed={isFavorite}
          >
            <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="h-4 truncate text-xs text-muted-foreground">{product.firmaMarkaIsim ?? ""}</p>
        <button
          type="button"
          title={product.isim}
          onClick={() => setDetailOpen(true)}
          className="line-clamp-2 h-10 text-left text-sm font-medium leading-5 text-foreground hover:text-primary"
        >
          {product.isim}
        </button>

        <div>
          <div className="flex h-7 items-baseline gap-2">
            {sale != null ? (
              <span className="text-lg font-bold tracking-tight text-primary">{formatPrice(sale)}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Fiyat sorunuz</span>
            )}
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(list!)}</span>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <p className="flex h-5 items-center text-[11px] font-medium text-[hsl(var(--success))]">
            {showFreeShipping && (
              <>
                <Truck className="mr-1 size-3.5 shrink-0" />
                {LABELS.freeShipping}
              </>
            )}
          </p>
          {onAddToCart && (
            <Button
              size="sm"
              className="h-9 w-full shadow-none! hover:translate-y-0! hover:shadow-none!"
              disabled={!inStock || cartState === "loading" || cartState === "success"}
              aria-busy={cartState === "loading"}
              onClick={addToCart}
            >
              {cartLabel}
            </Button>
          )}
        </div>
      </div>

      {detailOpen && <ProductDetailDialog product={product} onClose={() => setDetailOpen(false)} />}
    </article>
  );
}
