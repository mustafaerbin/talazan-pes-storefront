import Image from "next/image";
import Link from "next/link";
import { Eye, GitCompare, Heart, ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LABELS, ROUTES } from "@/config/constants";
import { formatPrice } from "@/lib/utils";
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
  showQuickActions = false,
  highlight = false,
}: ProductCardProps) {
  const inStock = (product.stokMiktari ?? 0) > 0;
  const slug = product.slug ?? String(product.id);
  const hasDiscount =
    product.listeTutari != null &&
    product.satisTutari != null &&
    product.listeTutari > product.satisTutari;
  const discountPercent = hasDiscount
    ? Math.round(((product.listeTutari! - product.satisTutari!) / product.listeTutari!) * 100)
    : 0;
  const installment = product.satisTutari ? Math.ceil(product.satisTutari / 12) : null;

  return (
    <Card
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden border-border/80 bg-card hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-hover",
        highlight && "ring-1 ring-primary/15",
      )}
    >
      <div className="relative">
        <Link
          href={ROUTES.product(slug)}
          className="relative block aspect-[4/5] overflow-hidden rounded-t-[var(--radius-card)] bg-secondary/50"
        >
          {product.resim ? (
            <Image
              src={product.resim}
              alt={product.isim}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-10 opacity-30" />
            </div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-bold text-white shadow-card">
              %{discountPercent}
            </Badge>
          )}
          {highlight && (
            <Badge className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-card">
              {LABELS.newBadge}
            </Badge>
          )}
          {!inStock && (
            <Badge variant="secondary" className="rounded-full text-[11px]">
              {LABELS.outOfStock}
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
          {onToggleFavorite && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-10 rounded-full border border-border bg-card shadow-card hover:border-primary/30"
              onClick={() => onToggleFavorite(product)}
              aria-label={LABELS.favorites}
            >
              <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
            </Button>
          )}
          {showQuickActions && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-10 rounded-full border border-border bg-card shadow-card hover:border-primary/30"
                asChild
              >
                <Link href={ROUTES.product(slug)} aria-label={LABELS.quickView}>
                  <Eye className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-10 rounded-full border border-border bg-card shadow-card hover:border-primary/30"
                aria-label={LABELS.compare}
              >
                <GitCompare className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col space-y-3.5 p-5">
        <div className="space-y-1.5">
          {product.firmaMarkaIsim && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {product.firmaMarkaIsim}
            </p>
          )}
          <Link
            href={ROUTES.product(slug)}
            className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {product.isim}
          </Link>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {formatPrice(product.satisTutari ?? 0)}
            </span>
            {hasDiscount && (
              <span className="text-sm font-medium text-muted-foreground line-through">
                {formatPrice(product.listeTutari!)}
              </span>
            )}
          </div>
          {installment && (
            <p className="text-xs text-muted-foreground">
              12 {LABELS.installment} {formatPrice(installment)}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--success)/0.1)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--success))]">
            <Truck className="size-3.5" />
            {LABELS.freeShipping}
          </span>
          {onAddToCart && (
            <Button size="sm" disabled={!inStock} onClick={() => onAddToCart(product)}>
              {LABELS.addToCart}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
