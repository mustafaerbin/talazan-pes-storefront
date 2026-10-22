"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, ImageOff, Search } from "lucide-react";
import { ProductDetailDialog } from "@/components/product/product-detail-dialog";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFavoriteToggle } from "@/hooks/use-favorites";
import { accountService } from "@/services/account.service";
import { formatPrice } from "@/lib/utils";
import type { FirmaUrunDto } from "@/types/api";
import { cn } from "@/lib/utils";

function CardImage({
  src,
  className,
  onFailed,
}: {
  src: string;
  className?: string;
  onFailed?: () => void;
}) {
  const [mode, setMode] = useState<"optimizer" | "native" | "failed">("optimizer");

  if (mode === "failed") return null;

  if (mode === "native") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("absolute inset-0 size-full", className)}
        onError={() => {
          setMode("failed");
          onFailed?.();
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className={className}
      sizes="(max-width: 768px) 50vw, 25vw"
      onError={() => setMode("native")}
    />
  );
}

interface ProductCardProps {
  product: FirmaUrunDto;
  onAddToCart?: (product: FirmaUrunDto) => void;
  onToggleFavorite?: (product: FirmaUrunDto) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
  highlight?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
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
  const href = ROUTES.product(product.slug ?? String(product.id));
  const [detailOpen, setDetailOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [hoverFailed, setHoverFailed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { toggle } = useFavoriteToggle();
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: accountService.getFavorites,
    enabled: !!user,
  });
  const isFavorite = favoriteIds.includes(product.id);

  useEffect(() => {
    setCoverFailed(false);
    setHoverFailed(false);
  }, [cover, hoverImage]);

  return (
    <article className="group flex h-full w-full flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <button
          type="button"
          aria-label={`${LABELS.quickView}: ${product.isim}`}
          className="absolute inset-0"
          onClick={() => setDetailOpen(true)}
        >
          {cover && !coverFailed ? (
            <>
              <CardImage
                key={cover}
                src={cover}
                className={cn(
                  "object-contain p-4 transition-opacity duration-300",
                  hoverImage && !hoverFailed && "group-hover:opacity-0",
                )}
                onFailed={() => setCoverFailed(true)}
              />
              {hoverImage && !hoverFailed && (
                <CardImage
                  key={hoverImage}
                  src={hoverImage}
                  className="object-contain p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  onFailed={() => setHoverFailed(true)}
                />
              )}
            </>
          ) : (
            <span className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8 opacity-40" />
            </span>
          )}
        </button>

        {hasDiscount && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground">
            %{discountPercent} indirim
          </span>
        )}
        {!inStock && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground">
            {LABELS.outOfStock}
          </span>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground"
            onClick={() => toggle(product.id, isFavorite)}
            aria-label={LABELS.favorites}
            aria-pressed={isFavorite}
          >
            <Heart className={cn("size-4", isFavorite && "fill-foreground")} />
          </button>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground"
            onClick={() => setDetailOpen(true)}
            aria-label={LABELS.quickView}
          >
            <Search className="size-4" />
          </button>
        </div>
      </div>

      <Link href={href} title={product.isim} className="flex flex-1 flex-col gap-1 pt-3 text-foreground">
        {(product.firmaMarkaIsim || product.firmaKategoriIsim) && (
          <p className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {[product.firmaMarkaIsim, product.firmaKategoriIsim].filter(Boolean).join(" · ")}
          </p>
        )}
        <span className="line-clamp-2 min-h-10 text-sm font-medium leading-5">
          {product.isim}
        </span>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          {sale != null ? (
            <>
              <span className="text-[15px] font-semibold tracking-tight">{formatPrice(sale)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(list!)}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Fiyat sorunuz</span>
          )}
        </div>
      </Link>

      {detailOpen && <ProductDetailDialog product={product} onClose={() => setDetailOpen(false)} />}
    </article>
  );
}
