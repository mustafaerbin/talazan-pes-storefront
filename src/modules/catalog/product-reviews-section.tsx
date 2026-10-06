"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductReviewItem } from "./product-detail-mock";
import { getReviewSummary } from "./product-detail-mock";

interface ProductReviewsSectionProps {
  reviews: ProductReviewItem[];
}

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const iconClass = size === "lg" ? "size-5" : "size-4";
  return (
    <span className="inline-flex items-center gap-0.5 text-primary" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(iconClass, star <= Math.round(value) ? "fill-primary" : "fill-muted/30 text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

export function ProductReviewsSection({ reviews }: ProductReviewsSectionProps) {
  const summary = getReviewSummary(reviews);
  const [helpful, setHelpful] = useState<Record<string, number>>({});

  if (!reviews.length) {
    return <p className="text-muted-foreground">Henüz değerlendirme yok.</p>;
  }

  const maxDist = Math.max(...summary.distribution, 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4 rounded-[var(--radius-card)] border border-border/70 bg-secondary/30 p-6">
        <p className="text-4xl font-extrabold tracking-tight">{summary.average.toFixed(1)}</p>
        <Stars value={summary.average} size="lg" />
        <p className="text-sm text-muted-foreground">{summary.count} değerlendirme</p>
        <div className="space-y-2 pt-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars - 1] ?? 0;
            const width = `${Math.round((count / maxDist) * 100)}%`;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground">{stars} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width }} />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="space-y-4">
        {reviews.map((review) => {
          const helpfulCount = helpful[review.id] ?? review.helpfulCount;
          return (
            <li
              key={review.id}
              className="rounded-[var(--radius-card)] border border-border/70 bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <Stars value={review.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{review.comment}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() =>
                  setHelpful((prev) => ({
                    ...prev,
                    [review.id]: (prev[review.id] ?? review.helpfulCount) + 1,
                  }))
                }
              >
                <ThumbsUp className="size-3.5" />
                Faydalı buldum ({helpfulCount})
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
