"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { LABELS, ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface CategoryGridProps {
  categories: FirmaKategoriDto[];
  title?: string;
  subtitle?: string;
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const roots = categories.filter((category) => !category.parent).slice(0, 2);
  if (!roots.length) return null;

  const items = [
    ...roots.map((category) => ({
      href: ROUTES.category(category.slug ?? String(category.id)),
      label: category.isim,
      Icon: getCategoryIcon(category.isim),
    })),
    {
      href: ROUTES.search,
      label: LABELS.allProducts,
      Icon: LayoutGrid,
    },
  ];

  return (
    <section className="border-y border-border bg-background">
      <div className={items.length > 2 ? "grid sm:grid-cols-3" : items.length === 2 ? "grid sm:grid-cols-2" : "grid"}>
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 px-6 py-4 text-sm text-foreground transition-colors hover:bg-secondary ${
              index > 0 ? "border-t border-border sm:border-t-0 sm:border-l" : ""
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <item.Icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
