"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface HeroCategorySidebarProps {
  categories: FirmaKategoriDto[];
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

  const activeChildren = activeId ? childrenByParent[activeId] ?? [] : [];

  return (
    <aside className="relative hidden lg:block">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-premium">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight">Kategoriler</h2>
        </div>
        <nav className="p-2" aria-label="Kategori menüsü">
          {rootCategories.map((category) => {
            const Icon = getCategoryIcon(category.isim);
            const isActive = activeId === category.id;

            return (
              <div
                key={category.id}
                onMouseEnter={() => setActiveId(category.id)}
                onMouseLeave={() => setActiveId(null)}
              >
                <Link
                  href={ROUTES.category(category.slug ?? String(category.id))}
                  className={`group flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/8 text-primary shadow-card"
                      : "text-foreground hover:bg-secondary hover:shadow-card"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary group-hover:bg-primary/10"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="line-clamp-1 flex-1">{category.isim}</span>
                  <ChevronRight
                    className={`size-4 shrink-0 transition-transform ${
                      isActive ? "translate-x-0.5 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {activeId && activeChildren.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 z-20 ml-3 w-56 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-hover"
            onMouseEnter={() => setActiveId(activeId)}
            onMouseLeave={() => setActiveId(null)}
          >
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alt Kategoriler
            </p>
            <ul className="space-y-1">
              {activeChildren.slice(0, 8).map((child) => (
                <li key={child.id}>
                  <Link
                    href={ROUTES.category(child.slug ?? String(child.id))}
                    className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    {child.isim}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
