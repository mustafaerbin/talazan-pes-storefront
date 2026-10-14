"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CategoryTreeNav } from "@/components/catalog/category-tree-nav";
import { InfiniteProductGrid } from "@/components/catalog/infinite-product-grid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { DEFAULT_PAGE_SIZE, LABELS, ROUTES, SORT_OPTIONS } from "@/config/constants";
import { useFirmaId } from "@/hooks/use-firma-id";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useInfiniteProducts, type ProductListMode } from "@/hooks/use-infinite-products";
import { ancestorPath, buildCategoryIndex, childCategories, withListingQuery } from "@/lib/category-tree";
import { storeService } from "@/services/store.service";
import type { FirmaKategoriDto, ProductFilters } from "@/types/api";

interface ProductListingProps {
  initialFilters?: ProductFilters;
  initialCategories?: FirmaKategoriDto[];
  title?: string;
}

export function ProductListing({ initialFilters = {}, initialCategories, title }: ProductListingProps) {
  const firmaId = useFirmaId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProduct } = useAddToCart();

  const liste = searchParams.get("liste");
  const showBrands = liste === "markalar";
  const pageTitle =
    liste === "yeni"
      ? LABELS.newArrivals
      : liste === "cok-satan"
        ? LABELS.bestSellers
        : liste === "indirimli"
          ? LABELS.discountedProducts
          : liste === "markalar"
            ? LABELS.brands
            : title;

  const listMode: ProductListMode =
    liste === "indirimli" ? "discounted" : liste === "yeni" ? "newest" : "default";

  const filters: Omit<ProductFilters, "page"> = {
    ...initialFilters,
    arama: searchParams.get("q") ?? initialFilters.arama,
    kategoriId: searchParams.get("kategoriId")
      ? Number(searchParams.get("kategoriId"))
      : initialFilters.kategoriId,
    markaId: searchParams.get("markaId")
      ? Number(searchParams.get("markaId"))
      : initialFilters.markaId,
    siralama:
      liste === "yeni"
        ? "id,desc"
        : (searchParams.get("siralama") ?? initialFilters.siralama ?? "satisTutari,desc"),
    stoktaVar: searchParams.get("stoktaVar") === "true" ? true : initialFilters.stoktaVar,
    minFiyat: searchParams.get("minFiyat")
      ? Number(searchParams.get("minFiyat"))
      : initialFilters.minFiyat,
    maxFiyat: searchParams.get("maxFiyat")
      ? Number(searchParams.get("maxFiyat"))
      : initialFilters.maxFiyat,
    size: DEFAULT_PAGE_SIZE,
  };

  const productsQuery = useInfiniteProducts(firmaId, filters, {
    mode: listMode,
    enabled: !showBrands,
  });

  const loadMore = useCallback(() => {
    if (!productsQuery.hasNextPage || productsQuery.isFetching) return;
    void productsQuery.fetchNextPage();
  }, [productsQuery.hasNextPage, productsQuery.isFetching, productsQuery.fetchNextPage]);

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brands", firmaId],
    queryFn: () => storeService.getBrands(firmaId),
    enabled: showBrands,
  });

  const products = productsQuery.products;
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories", firmaId],
    queryFn: () => storeService.getCategories(firmaId),
    enabled: !showBrands,
    initialData: initialCategories,
    staleTime: 5 * 60 * 1000,
  });
  const categoryIndex = useMemo(() => buildCategoryIndex(categories), [categories]);
  const activeCategory = filters.kategoriId != null ? categoryIndex.byId.get(filters.kategoriId) : undefined;
  const categoryCrumbs = activeCategory ? ancestorPath(activeCategory.id, categoryIndex) : [];
  const subcategories = activeCategory ? childCategories(categoryIndex, activeCategory.id) : [];

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParam("q", searchText.trim());
  };

  return (
    <div className="space-y-8">
      {showBrands && pageTitle && <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>}

      {showBrands ? (
        brandsLoading ? (
          <ProductGridSkeleton />
        ) : brands.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{LABELS.noResults}</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 py-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`${ROUTES.search}?markaId=${brand.id}`}
                className="text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {brand.isim}
              </Link>
            ))}
          </div>
        )
      ) : (
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CategoryTreeNav
          categories={categories}
          activeId={filters.kategoriId}
          isLoading={categoriesLoading}
          isError={categoriesError}
        />

        <div className="min-w-0 space-y-5">
          {categoryCrumbs.length > 0 && (
            <Breadcrumbs
              items={categoryCrumbs.map((category, index) => ({
                label: category.isim,
                href:
                  index < categoryCrumbs.length - 1
                    ? withListingQuery(ROUTES.category(category.slug || String(category.id)), searchParams)
                    : undefined,
              }))}
            />
          )}
          {pageTitle && <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{pageTitle}</h1>}
          {subcategories.length > 0 && (
            <ul className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {subcategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={withListingQuery(ROUTES.category(category.slug || String(category.id)), searchParams)}
                    title={category.isim}
                    className="inline-flex max-w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:text-primary"
                  >
                    <span className="truncate">{category.isim}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-card lg:flex-row lg:items-center">
            <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={LABELS.searchPlaceholder}
                aria-label={LABELS.searchPlaceholder}
                className="h-10 pl-9"
              />
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                aria-label={LABELS.priceRange}
                className="h-10 w-24"
                defaultValue={filters.minFiyat}
                onBlur={(event) => updateParam("minFiyat", event.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                aria-label={LABELS.priceRange}
                className="h-10 w-24"
                defaultValue={filters.maxFiyat}
                onBlur={(event) => updateParam("maxFiyat", event.target.value)}
              />
              <select
                aria-label={LABELS.sortBy}
                className="h-10 rounded-[var(--radius-input)] border border-input bg-background px-3 text-sm"
                defaultValue={filters.siralama}
                onChange={(event) => updateParam("siralama", event.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                role="switch"
                aria-checked={filters.stoktaVar === true}
                onClick={() => updateParam("stoktaVar", filters.stoktaVar ? "" : "true")}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium"
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    filters.stoktaVar ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow-card transition-transform ${
                      filters.stoktaVar ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
                {LABELS.inStockOnly}
              </button>
            </div>
          </div>

          {!productsQuery.isLoading &&
            (listMode === "default" ? productsQuery.totalElements != null : true) && (
              <p className="text-sm font-medium text-muted-foreground">
                {listMode === "default" ? (productsQuery.totalElements ?? 0) : products.length}{" "}
                {LABELS.results}
              </p>
            )}

          <InfiniteProductGrid
            products={products}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            isFetchingNextPage={productsQuery.isFetchingNextPage}
            hasNextPage={productsQuery.hasNextPage}
            onLoadMore={loadMore}
            onRetry={() => void productsQuery.refetch()}
            onAddToCart={(product) => addProduct(product)}
          />
        </div>
      </div>
      )}
    </div>
  );
}
