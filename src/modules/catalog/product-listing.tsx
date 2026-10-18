"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CategoryTreeNav } from "@/components/catalog/category-tree-nav";
import { InfiniteProductGrid } from "@/components/catalog/infinite-product-grid";
import { ListingFilters } from "@/components/catalog/listing-filters";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addProduct } = useAddToCart();
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  const resultCount = listMode === "default" ? productsQuery.totalElements ?? products.length : products.length;

  const replaceParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const updateParam = (key: string, value: string) => {
    replaceParams((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  };

  const clearFilters = () => {
    if (pathname.startsWith("/kategori/")) {
      router.push(pathname);
      return;
    }
    router.push(ROUTES.search);
  };

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (activeCategory) {
    activeChips.push({
      label: activeCategory.isim,
      onRemove: () => {
        if (pathname.startsWith("/kategori/")) router.push(ROUTES.search);
        else updateParam("kategoriId", "");
      },
    });
  }
  if (filters.minFiyat != null) {
    activeChips.push({ label: `En az ₺${filters.minFiyat}`, onRemove: () => updateParam("minFiyat", "") });
  }
  if (filters.maxFiyat != null) {
    activeChips.push({ label: `En çok ₺${filters.maxFiyat}`, onRemove: () => updateParam("maxFiyat", "") });
  }
  if (liste === "indirimli" && !title?.includes("İndirim")) {
    activeChips.push({ label: "İndirimli", onRemove: () => updateParam("liste", "") });
  }

  return (
    <div className="space-y-6">
      {showBrands && pageTitle && <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>}

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
                className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {brand.isim}
              </Link>
            ))}
          </div>
        )
      ) : (
      <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <CategoryTreeNav
            categories={categories}
            activeId={filters.kategoriId}
            isLoading={categoriesLoading}
            isError={categoriesError}
          />
        </div>

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
          {pageTitle && <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{pageTitle}</h1>}
          {subcategories.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {subcategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={withListingQuery(ROUTES.category(category.slug || String(category.id)), searchParams)}
                    title={category.isim}
                    className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    {category.isim}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {productsQuery.isLoading ? LABELS.loading : `${resultCount} ürün`}
            </p>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Filtrele
            </button>
            <select
              aria-label={LABELS.sortBy}
              className="ml-auto h-9 rounded-md border border-border bg-background px-3 text-sm"
              defaultValue={filters.siralama}
              onChange={(event) => updateParam("siralama", event.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-sm"
                >
                  {chip.label}
                  <X className="size-3.5" />
                </button>
              ))}
              <button type="button" className="inline-flex items-center gap-1 text-sm text-muted-foreground" onClick={clearFilters}>
                Temizle <X className="size-3.5" />
              </button>
            </div>
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

      <ListingFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        activeCategoryId={filters.kategoriId}
        minFiyat={filters.minFiyat}
        maxFiyat={filters.maxFiyat}
        discounted={liste === "indirimli"}
        resultCount={resultCount}
        onClear={clearFilters}
        onApply={({ kategoriId, minFiyat, maxFiyat, discounted }) => {
          replaceParams((params) => {
            if (kategoriId) params.set("kategoriId", kategoriId);
            else params.delete("kategoriId");
            if (minFiyat) params.set("minFiyat", minFiyat);
            else params.delete("minFiyat");
            if (maxFiyat) params.set("maxFiyat", maxFiyat);
            else params.delete("maxFiyat");
            if (discounted) params.set("liste", "indirimli");
            else if (params.get("liste") === "indirimli") params.delete("liste");
          });
        }}
      />
    </div>
  );
}
