"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_PAGE_SIZE, LABELS, SORT_OPTIONS } from "@/config/constants";
import { useFirmaId } from "@/hooks/use-firma-id";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { storeService } from "@/services/store.service";
import type { ProductFilters } from "@/types/api";

interface ProductListingProps {
  initialFilters?: ProductFilters;
  title?: string;
}

export function ProductListing({ initialFilters = {}, title }: ProductListingProps) {
  const firmaId = useFirmaId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProduct } = useAddToCart();

  const filters: ProductFilters = {
    ...initialFilters,
    arama: searchParams.get("q") ?? initialFilters.arama,
    kategoriId: searchParams.get("kategoriId")
      ? Number(searchParams.get("kategoriId"))
      : initialFilters.kategoriId,
    markaId: searchParams.get("markaId")
      ? Number(searchParams.get("markaId"))
      : initialFilters.markaId,
    siralama: searchParams.get("siralama") ?? initialFilters.siralama ?? "satisTutari,desc",
    stoktaVar: searchParams.get("stoktaVar") === "true" ? true : initialFilters.stoktaVar,
    minFiyat: searchParams.get("minFiyat")
      ? Number(searchParams.get("minFiyat"))
      : initialFilters.minFiyat,
    maxFiyat: searchParams.get("maxFiyat")
      ? Number(searchParams.get("maxFiyat"))
      : initialFilters.maxFiyat,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    size: DEFAULT_PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", firmaId, filters],
    queryFn: () => storeService.getProducts(firmaId, filters),
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-border/60 p-5">
          <h2 className="font-semibold">{LABELS.filters}</h2>
          <div className="space-y-2">
            <Label htmlFor="minFiyat">{LABELS.priceRange}</Label>
            <div className="flex gap-2">
              <Input
                id="minFiyat"
                type="number"
                placeholder="Min"
                defaultValue={filters.minFiyat}
                onBlur={(e) => updateParam("minFiyat", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                defaultValue={filters.maxFiyat}
                onBlur={(e) => updateParam("maxFiyat", e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked={filters.stoktaVar}
              onChange={(e) => updateParam("stoktaVar", e.target.checked ? "true" : "")}
            />
            {LABELS.onlyInStock}
          </label>
          <div className="space-y-2">
            <Label htmlFor="siralama">{LABELS.sortBy}</Label>
            <select
              id="siralama"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={filters.siralama}
              onChange={(e) => updateParam("siralama", e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div className="space-y-6">
          {data?.pageInfo && (
            <p className="text-sm text-muted-foreground">
              {data.pageInfo.totalElements} {LABELS.results}
            </p>
          )}

          {isLoading && <ProductGridSkeleton />}
          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p>{LABELS.error}</p>
              <Button className="mt-4" onClick={() => refetch()}>
                {LABELS.retry}
              </Button>
            </div>
          )}
          {!isLoading && !isError && data?.items.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">{LABELS.noResults}</p>
          )}
          {!isLoading && data && data.items.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
