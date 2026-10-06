"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import type { FirmaUrunDto } from "@/types/api";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: FirmaUrunDto[];
  viewAllHref?: string;
  loading?: boolean;
  onAddToCart?: (product: FirmaUrunDto) => void;
  variant?: "default" | "flash";
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
  loading,
  onAddToCart,
  variant = "default",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const node = scrollRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.75;
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader title={title} subtitle={subtitle} href={viewAllHref} className="flex-1" />
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            aria-label="Önceki ürünler"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            aria-label="Sonraki ürünler"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-1 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-1 pb-2"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex w-[230px] shrink-0 snap-start sm:w-[250px] md:w-[270px] lg:w-[290px]"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                showQuickActions
                highlight={variant === "flash"}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
