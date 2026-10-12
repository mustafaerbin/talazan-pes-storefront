"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { storeService } from "@/services/store.service";
import type { FirmaUrunDto, ProductFilters } from "@/types/api";

export type ProductListMode = "default" | "discounted" | "newest";

function isDiscounted(product: FirmaUrunDto) {
  return (
    product.listeTutari != null &&
    product.satisTutari != null &&
    product.listeTutari > product.satisTutari
  );
}

export function useInfiniteProducts(
  firmaId: number,
  filters: Omit<ProductFilters, "page">,
  options?: { mode?: ProductListMode; enabled?: boolean; scope?: string },
) {
  const mode = options?.mode ?? "default";
  const enabled = options?.enabled ?? true;
  const scope = options?.scope ?? "listing";
  const size = filters.size ?? DEFAULT_PAGE_SIZE;

  const query = useInfiniteQuery({
    queryKey: ["products", scope, firmaId, filters, mode],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      storeService.getProducts(firmaId, { ...filters, page: pageParam, size }),
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const current = lastPage.pageInfo?.currentPage ?? lastPageParam;
      const next = current + 1;
      if (lastPage.pageInfo?.totalPages != null) {
        return next < lastPage.pageInfo.totalPages ? next : undefined;
      }
      return lastPage.items.length < size ? undefined : next;
    },
  });

  const products = (() => {
    const seen = new Map<number, FirmaUrunDto>();
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items) seen.set(item.id, item);
    }
    let items = [...seen.values()];
    if (mode === "discounted") items = items.filter(isDiscounted);
    if (mode === "newest") items.sort((a, b) => b.id - a.id);
    return items;
  })();

  const pageCount = query.data?.pages.length ?? 0;

  useEffect(() => {
    if (mode !== "discounted") return;
    if (!query.hasNextPage || query.isFetching) return;
    if (pageCount === 0 || pageCount >= 8) return;
    if (products.length >= size) return;
    void query.fetchNextPage();
  }, [
    mode,
    query.hasNextPage,
    query.isFetching,
    query.fetchNextPage,
    pageCount,
    products.length,
    size,
  ]);

  return {
    products,
    totalElements: query.data?.pages.at(-1)?.pageInfo?.totalElements,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isSuccess: query.isSuccess,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
