"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromotionCard } from "@/types/api";

interface PromotionBannerProps {
  promotions: PromotionCard[];
}

export function PromotionBanner({ promotions }: PromotionBannerProps) {
  if (!promotions.length) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {promotions.map((promo, index) => (
        <motion.div
          key={`${promo.baslik}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="group relative overflow-hidden rounded-[var(--radius-section)] border border-border bg-card shadow-premium"
        >
          {promo.resimUrl ? (
            <Image
              src={promo.resimUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="gradient-primary-subtle absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/80 to-card/30" />

          <div className="relative z-10 flex min-h-[200px] flex-col justify-center p-8 md:min-h-[240px] md:p-10">
            <span className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              Kampanya
            </span>
            <h3 className="max-w-sm text-2xl font-extrabold tracking-tight md:text-3xl">{promo.baslik}</h3>
            {promo.altBaslik && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                {promo.altBaslik}
              </p>
            )}
            {promo.url && (
              <Button asChild className="mt-6 w-fit">
                <Link href={promo.url}>
                  {promo.ctaMetin ?? "Keşfet"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
