"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { CategoryTreeList } from "@/components/catalog/category-tree-list";
import { LABELS, ROUTES } from "@/config/constants";
import { buildCategoryIndex, searchCategories, type CategoryRef } from "@/lib/category-tree";
import type { FirmaKategoriDto } from "@/types/api";

function categoryHref(category: CategoryRef) {
  return ROUTES.category(category.slug || String(category.id));
}

export function CategoryDrilldown({
  categories,
  onNavigate,
}: {
  categories: FirmaKategoriDto[];
  onNavigate: () => void;
}) {
  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const results = useMemo(
    () => searchCategories(categories, deferredSearch, index),
    [categories, deferredSearch, index],
  );
  const searching = deferredSearch.trim().length > 0;

  if (!index.roots.length) return null;

  return (
    <div className="min-w-0">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={LABELS.categorySearch}
        aria-label={LABELS.categorySearch}
        className="mb-3 h-11 w-full rounded-[var(--radius-input)] border border-input bg-background px-3 text-base"
      />

      {searching ? (
        results.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{LABELS.categoryNotFound}</p>
        ) : (
          <ul>
            {results.slice(0, 40).map((hit) => (
              <li key={hit.category.id}>
                <Link
                  href={categoryHref(hit.category)}
                  onClick={onNavigate}
                  className="block min-h-11 rounded-lg px-2 py-2"
                >
                  <span className="block text-sm font-medium text-foreground">{hit.category.isim}</span>
                  <span className="block text-xs text-muted-foreground">{hit.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <CategoryTreeList index={index} hrefFor={categoryHref} onNavigate={onNavigate} />
      )}
    </div>
  );
}
