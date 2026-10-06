"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/config/constants";
import type { FirmaKategoriDto } from "@/types/api";

interface CategoryGridProps {
  categories: FirmaKategoriDto[];
  title?: string;
  subtitle?: string;
}

export function CategoryGrid({ categories, title, subtitle }: CategoryGridProps) {
  if (!categories.length) return null;

  return (
    <section className="space-y-8">
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">{title}</h2>
          )}
          {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.slice(0, 12).map((category, index) => {
          const Icon = getCategoryIcon(category.isim);
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link
                href={ROUTES.category(category.slug ?? String(category.id))}
                className="group flex h-full flex-col items-center rounded-[var(--radius-card)] border border-border bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-hover"
              >
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-card">
                  <Icon className="size-7" />
                </div>
                <span className="line-clamp-2 text-sm font-bold leading-snug">{category.isim}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  Keşfet
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
