"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface HeroCategorySidebarProps {
  categories: FirmaKategoriDto[];
}

function CategoryRow({
  category,
  active = false,
  expanded = false,
  onToggle,
}: {
  category: FirmaKategoriDto;
  active?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const Icon = getCategoryIcon(category.isim);
  const className = `group flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 ${
    active
      ? "bg-primary/8 text-primary shadow-card"
      : "text-foreground hover:bg-secondary hover:shadow-card"
  }`;
  const content = (
    <>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
          active
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-primary group-hover:bg-primary/10"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="line-clamp-1 flex-1">{category.isim}</span>
      <ChevronRight
        className={`size-4 shrink-0 transition-transform ${
          expanded ? "rotate-90 text-primary" : active ? "translate-x-0.5 text-primary" : "text-muted-foreground"
        }`}
      />
    </>
  );

  if (onToggle) {
    return (
      <button type="button" className={className} aria-expanded={expanded} onClick={onToggle}>
        {content}
      </button>
    );
  }

  return (
    <Link href={ROUTES.category(category.slug ?? String(category.id))} className={className}>
      {content}
    </Link>
  );
}

export function HeroCategorySidebar({ categories }: HeroCategorySidebarProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const rootCategories = categories.filter((cat) => !cat.parent).slice(0, 10);

  const childrenByParent = categories.reduce<Record<number, FirmaKategoriDto[]>>((acc, cat) => {
    const parentId = cat.parent?.id;
    if (parentId) {
      acc[parentId] = acc[parentId] ? [...acc[parentId], cat] : [cat];
    }
    return acc;
  }, {});

  if (!rootCategories.length) return null;

  return (
    <aside className="relative hidden lg:block">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-premium">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight">Kategoriler</h2>
        </div>
        <nav className="p-2" aria-label="Kategori menüsü">
          {rootCategories.map((category) => {
            const children = childrenByParent[category.id] ?? [];
            const isActive = activeId === category.id;

            return (
              <div key={category.id}>
                <CategoryRow
                  category={category}
                  active={isActive}
                  expanded={isActive && children.length > 0}
                  onToggle={
                    children.length > 0
                      ? () => setActiveId((current) => (current === category.id ? null : category.id))
                      : undefined
                  }
                />
                {isActive && children.length > 0 && (
                  <div className="mt-1">
                    {children.map((child) => (
                      <CategoryRow key={child.id} category={child} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
