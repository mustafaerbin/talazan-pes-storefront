"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Grid3x3 } from "lucide-react";
import { CategoryTreeList } from "@/components/catalog/category-tree-list";
import { LABELS, ROUTES } from "@/config/constants";
import { buildCategoryIndex, searchCategories, type CategoryRef } from "@/lib/category-tree";
import type { FirmaKategoriDto } from "@/types/api";

interface MegaMenuProps {
  categories: FirmaKategoriDto[];
}

function categoryHref(category: CategoryRef) {
  return ROUTES.category(category.slug || String(category.id));
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [box, setBox] = useState({ top: 0, left: 8, width: 320 });
  const deferredSearch = useDeferredValue(search);
  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const results = useMemo(
    () => searchCategories(categories, deferredSearch, index),
    [categories, deferredSearch, index],
  );

  const searching = deferredSearch.trim().length > 0;
  const activeId = categories.find((category) => pathname === categoryHref(category))?.id;

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(320, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setBox({ top: rect.bottom + 8, left, width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!index.roots.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setSearch("");
        }}
        className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
      >
        <Grid3x3 className="size-4" />
        {LABELS.allCategories}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={LABELS.allCategories}
          className="fixed z-[60] flex max-h-[min(32rem,calc(100vh-6rem))] flex-col overflow-hidden rounded-xl border border-border bg-card"
          style={{ top: box.top, left: box.left, width: box.width }}
        >
          <div className="border-b border-border p-3">
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={LABELS.categorySearch}
              aria-label={LABELS.categorySearch}
              className="h-10 w-full rounded-[var(--radius-input)] border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {searching ? (
              results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">{LABELS.categoryNotFound}</p>
              ) : (
                <ul>
                  {results.slice(0, 40).map((hit) => (
                    <li key={hit.category.id}>
                      <Link
                        href={categoryHref(hit.category)}
                        onClick={() => close()}
                        className="block rounded-lg px-3 py-2.5 hover:bg-muted"
                      >
                        <span className="block truncate text-sm font-medium text-foreground">{hit.category.isim}</span>
                        <span className="block truncate text-xs text-muted-foreground">{hit.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <CategoryTreeList
                index={index}
                hrefFor={categoryHref}
                activeId={activeId}
                onNavigate={() => close()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
