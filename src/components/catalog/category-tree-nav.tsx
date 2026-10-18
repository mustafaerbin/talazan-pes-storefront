"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CategoryTreeList } from "@/components/catalog/category-tree-list";
import { LABELS, ROUTES } from "@/config/constants";
import { buildCategoryIndex, withListingQuery, type CategoryRef } from "@/lib/category-tree";
import type { FirmaKategoriDto } from "@/types/api";

interface CategoryTreeNavProps {
  categories: FirmaKategoriDto[];
  activeId?: number;
  isLoading?: boolean;
  isError?: boolean;
}

export function CategoryTreeNav({ categories, activeId, isLoading, isError }: CategoryTreeNavProps) {
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const allProductsActive = activeId == null && !searchParams.get("liste");
  const hrefFor = (category: CategoryRef) =>
    withListingQuery(ROUTES.category(category.slug || String(category.id)), searchParams);

  return (
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="lg:border-0">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground lg:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {LABELS.categories}
          <ChevronRight className={`size-4 transition-transform ${menuOpen ? "rotate-90" : ""}`} />
        </button>
        <div className={menuOpen ? "border-t border-border p-2 lg:border-t-0" : "hidden p-2 lg:block"}>
          <p className="hidden px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
            {LABELS.categories}
          </p>
          <Link
            href={withListingQuery(ROUTES.search, searchParams)}
            className={`mb-1 flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold hover:bg-muted ${
              allProductsActive ? "text-primary" : "text-foreground"
            }`}
          >
            {LABELS.allProducts}
          </Link>
          {isLoading && <p className="px-3 py-2 text-sm text-muted-foreground">{LABELS.loading}</p>}
          {isError && <p className="px-3 py-2 text-sm text-muted-foreground">{LABELS.categoriesUnavailable}</p>}
          <CategoryTreeList index={index} hrefFor={hrefFor} activeId={activeId} />
        </div>
      </div>
    </aside>
  );
}
