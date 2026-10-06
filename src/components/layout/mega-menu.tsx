"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Grid3x3 } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { LABELS, ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface MegaMenuProps {
  categories: FirmaKategoriDto[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const rootCategories = categories.filter((cat) => !cat.parent);

  const childrenByParent = categories.reduce<Record<number, FirmaKategoriDto[]>>((acc, cat) => {
    const parentId = cat.parent?.id;
    if (parentId) {
      acc[parentId] = acc[parentId] ? [...acc[parentId], cat] : [cat];
    }
    return acc;
  }, {});

  if (!rootCategories.length) return null;

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Grid3x3 className="size-4" />
        {LABELS.allCategories}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full z-50 mt-3 w-[780px] rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-hover"
          >
            <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto">
              {rootCategories.slice(0, 12).map((category) => {
                const Icon = getCategoryIcon(category.isim);
                const children = childrenByParent[category.id] ?? [];
                return (
                  <div
                    key={category.id}
                    className="rounded-[14px] border border-transparent p-3.5 transition-all hover:border-border hover:bg-secondary/50 hover:shadow-card"
                  >
                    <Link
                      href={ROUTES.category(category.slug ?? String(category.id))}
                      className="flex items-center gap-2.5 font-bold hover:text-primary"
                    >
                      <span className="flex size-8 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Icon className="size-4" />
                      </span>
                      {category.isim}
                    </Link>
                    {children.length > 0 && (
                      <ul className="mt-2.5 space-y-1 pl-10">
                        {children.slice(0, 4).map((child) => (
                          <li key={child.id}>
                            <Link
                              href={ROUTES.category(child.slug ?? String(child.id))}
                              className="text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                              {child.isim}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href={ROUTES.search}
                className="inline-flex items-center gap-1 text-sm font-bold text-primary"
              >
                Tüm kategorileri gör
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
