"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { Button } from "@/components/ui/button";
import { LABELS } from "@/config/constants";
import type { FirmaUrunDto } from "@/types/api";

interface InfiniteProductGridProps {
  products: FirmaUrunDto[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onAddToCart: (product: FirmaUrunDto) => void;
  columns?: "listing" | "home";
  highlight?: boolean;
  showQuickActions?: boolean;
  emptyLabel?: string;
}

export function InfiniteProductGrid({
  products,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRetry,
  onAddToCart,
  highlight = false,
  showQuickActions = false,
  emptyLabel = LABELS.noResults,
}: InfiniteProductGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const busyRef = useRef(false);
  onLoadMoreRef.current = onLoadMore;
  busyRef.current = isLoading || isFetchingNextPage || isError || !hasNextPage;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (busyRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, products.length]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading || isError) return;
    const node = sentinelRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 480) onLoadMore();
  }, [products.length, hasNextPage, isFetchingNextPage, isLoading, isError, onLoadMore]);

  if (isLoading) return <ProductGridSkeleton />;

  if (isError && products.length === 0) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p>{LABELS.error}</p>
        <Button className="mt-4" onClick={onRetry}>
          {LABELS.retry}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        {hasNextPage ? (
          <>
            <p className="py-8 text-center text-sm text-muted-foreground" aria-live="polite">
              {LABELS.loading}
            </p>
            <div ref={sentinelRef} data-infinite-sentinel="" className="h-px w-full" aria-hidden />
          </>
        ) : (
          <p className="py-12 text-center text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            showQuickActions={showQuickActions}
            highlight={highlight}
          />
        ))}
      </div>
      {hasNextPage && <div ref={sentinelRef} data-infinite-sentinel="" className="h-px w-full" aria-hidden />}
      {isFetchingNextPage && (
        <p className="text-center text-sm text-muted-foreground" aria-live="polite">
          {LABELS.loading}
        </p>
      )}
      {isError && (
        <div className="text-center">
          <Button variant="outline" onClick={onRetry}>
            {LABELS.retry}
          </Button>
        </div>
      )}
    </div>
  );
}
