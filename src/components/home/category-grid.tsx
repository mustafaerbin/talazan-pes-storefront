"use client";

import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface CategoryGridProps {
  categories: FirmaKategoriDto[];
  title?: string;
  subtitle?: string;
}

export function CategoryGrid({ categories, title, subtitle }: CategoryGridProps) {
  const visible = categories.filter((category) => !category.parent).slice(0, 8);
  if (!visible.length) return null;
  const columns =
    visible.length <= 2
      ? "grid-cols-2"
      : visible.length <= 4
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title && <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className={`grid gap-3 ${columns}`}>
        {visible.map((category) => {
          const Icon = getCategoryIcon(category.isim);
          return (
            <Link
              key={category.id}
              href={ROUTES.category(category.slug ?? String(category.id))}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <span className="line-clamp-2 text-sm font-semibold leading-snug">{category.isim}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
