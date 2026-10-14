"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Check, Heart, ImageOff, ShoppingBag, Star, Truck } from "lucide-react";
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
  const hoverImage = images[1];
  const [detailOpen, setDetailOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [hoverFailed, setHoverFailed] = useState(false);
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
  const reviewCount = product.yorumSayisi ?? 0;
  const reviewAverage = product.ortalamaPuan ?? 0;

  useEffect(() => {
    setImageFailed(false);
    setHoverFailed(false);
  }, [cover, hoverImage]);

  useEffect(() => {
    if (cartState !== "success" && cartState !== "error") return;
    const timer = window.setTimeout(() => {
      cartLock.current = false;
      setCartState("idle");
    }, cartState === "success" ? 1200 : 1600);
    return () => window.clearTimeout(timer);
  }, [cartState]);

  const addToCart = (event?: MouseEvent) => {
    event?.stopPropagation();
    event?.preventDefault();
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
        ? "Eklendi"
        : cartState === "error"
          ? "Eklenemedi"
          : LABELS.addToCart;

  return (
    <article
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card transition-shadow duration-200 hover:shadow-hover",
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
            <>
              <Image
                src={cover}
                alt=""
                fill
                className={cn(
                  "object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]",
                  hoverImage && !hoverFailed && "group-hover:opacity-0",
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
                onError={() => setImageFailed(true)}
              />
              {hoverImage && !hoverFailed && (
                <Image
                  src={hoverImage}
                  alt=""
                  fill
                  className="object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onError={() => setHoverFailed(true)}
                />
              )}
            </>
          ) : (
            <span className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8 opacity-40" />
            </span>
          )}
        </button>

        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {hasDiscount && (
            <span className="rounded-md bg-destructive px-1.5 py-0.5 text-[11px] font-semibold text-white">
              -%{discountPercent}
            </span>
          )}
          {showFreeShipping && inStock && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--success))] shadow-sm">
              <Truck className="size-3" />
              {LABELS.freeShipping}
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
            className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground opacity-100 shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
            onClick={() => onToggleFavorite(product)}
            aria-label={LABELS.favorites}
            aria-pressed={isFavorite}
          >
            <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
          </button>
        )}

        {onAddToCart && inStock && (
          <>
            <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 hidden translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:block">
              <Button
                size="sm"
                className="pointer-events-auto h-9 w-full"
                disabled={cartState === "loading" || cartState === "success"}
                aria-busy={cartState === "loading"}
                onClick={addToCart}
              >
                {cartState === "success" ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                {cartLabel}
              </Button>
            </div>
            <button
              type="button"
              className="absolute bottom-2 right-2 z-10 inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:hidden"
              disabled={cartState === "loading" || cartState === "success"}
              aria-label={cartLabel}
              onClick={addToCart}
            >
              {cartState === "success" ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.firmaMarkaIsim && (
          <p className="truncate text-xs text-muted-foreground">{product.firmaMarkaIsim}</p>
        )}
        <button
          type="button"
          title={product.isim}
          onClick={() => setDetailOpen(true)}
          className="line-clamp-2 min-h-10 text-left text-sm font-medium leading-5 text-foreground hover:text-primary"
        >
          {product.isim}
        </button>

        {reviewCount > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{reviewAverage.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </p>
        )}

        <div className="mt-auto">
          {sale != null ? (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">{formatPrice(sale)}</span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(list!)}</span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Fiyat sorunuz</span>
          )}
        </div>
      </div>

      {detailOpen && <ProductDetailDialog product={product} onClose={() => setDetailOpen(false)} />}
    </article>
  );
}
