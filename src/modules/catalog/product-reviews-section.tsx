"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/api/client";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { storeService } from "@/services/store.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface ProductReviewsSectionProps {
  productId: number;
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

function formatReviewDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const firmaId = useFirmaId();
  const user = useAuthStore((s) => s.user);
  const openLogin = useSidePanelStore((s) => s.openLogin);
  const queryClient = useQueryClient();
  const queryKey = ["product-reviews", firmaId, productId] as const;
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => storeService.getProductReviews(firmaId, productId),
    enabled: firmaId > 0 && productId > 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      storeService.createProductReview(productId, {
        firmaId,
        puan: rating,
        baslik: title.trim() || undefined,
        yorum: comment.trim(),
      }),
    onSuccess: () => {
      setComment("");
      setTitle("");
      setRating(5);
      toast.success("Değerlendirmeniz alındı. Onaylandıktan sonra burada görünecek.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const helpfulMutation = useMutation({
    mutationFn: (id: number) => storeService.markReviewHelpful(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const reviews = data?.yorumlar ?? [];
  const average = data?.ortalamaPuan ?? 0;
  const count = data?.yorumSayisi ?? 0;
  const distribution = data?.dagilim ?? [0, 0, 0, 0, 0];
  const maxDist = Math.max(...distribution, 1);

  const submit = () => {
    if (comment.trim().length < 10) {
      toast.error("Yorum en az 10 karakter olmalıdır.");
      return;
    }
    createMutation.mutate();
  };

  const eligibilityNote = () => {
    if (data?.yorumYazabilir) return null;
    switch (data?.yorumYazmaNedeni) {
      case "GIRIS_GEREKLI":
        return (
          <p className="text-sm text-muted-foreground">
            Değerlendirmek için{" "}
            <button type="button" className="font-semibold text-primary hover:underline" onClick={openLogin}>
              {LABELS.login.toLowerCase()}
            </button>
            {" "}yapın.
          </p>
        );
      case "SATIN_ALMA_YOK":
        return <p className="text-sm text-muted-foreground">Bu ürünü satın alan müşteriler değerlendirebilir.</p>;
      case "BEKLEMEDE":
        return <p className="text-sm text-muted-foreground">Değerlendirmeniz onay bekliyor.</p>;
      case "YAZILDI":
        return <p className="text-sm text-muted-foreground">Bu ürünü değerlendirdiniz.</p>;
      default:
        return user ? null : (
          <p className="text-sm text-muted-foreground">
            Değerlendirmek için{" "}
            <Link href={ROUTES.login} className="font-semibold text-primary hover:underline">
              giriş yapın
            </Link>
            .
          </p>
        );
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Değerlendirmeler yükleniyor…</p>;
  }

  return (
    <div className="space-y-8">
      {count > 0 && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="space-y-4 rounded-[var(--radius-card)] border border-border/70 bg-secondary/30 p-6">
            <p className="text-4xl font-semibold tracking-tight">{average.toFixed(1)}</p>
            <Stars value={average} size="lg" />
            <p className="text-sm text-muted-foreground">{count} değerlendirme</p>
            <div className="space-y-2 pt-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const barCount = distribution[stars - 1] ?? 0;
                const width = `${Math.round((barCount / maxDist) * 100)}%`;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-muted-foreground">{stars} ★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{barCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-[var(--radius-card)] border border-border/70 bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{review.musteriAdi}</p>
                    <p className="text-xs text-muted-foreground">{formatReviewDate(review.createDate)}</p>
                  </div>
                  <Stars value={review.puan ?? 0} />
                </div>
                {review.baslik && <p className="mt-3 text-sm font-semibold">{review.baslik}</p>}
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.yorum}</p>
                {review.saticiCevap && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm">
                    <p className="text-xs font-semibold text-primary">Satıcı cevabı</p>
                    <p className="mt-1 leading-relaxed text-foreground/90">{review.saticiCevap}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => helpfulMutation.mutate(review.id)}
                  disabled={helpfulMutation.isPending}
                >
                  <ThumbsUp className="size-3.5" />
                  Faydalı buldum ({review.faydaliSayisi ?? 0})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {count === 0 && <p className="text-sm text-muted-foreground">Henüz değerlendirme yok.</p>}

      <div className="rounded-[var(--radius-card)] border border-border/70 bg-secondary/20 p-5">
        <p className="mb-3 text-sm font-semibold">Ürünü değerlendirin</p>
        {data?.yorumYazabilir ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} yıldız`}
                  className="p-0.5 text-primary"
                >
                  <Star className={cn("size-6", star <= rating ? "fill-primary" : "fill-muted/30 text-muted-foreground/40")} />
                </button>
              ))}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (isteğe bağlı)" maxLength={200} className="bg-card" />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ürün hakkındaki deneyiminizi yazın"
              className="min-h-[88px] resize-none bg-card"
              maxLength={4000}
            />
            <Button type="button" size="sm" onClick={submit} disabled={createMutation.isPending || !comment.trim()}>
              {createMutation.isPending ? "Gönderiliyor…" : "Değerlendirmeyi gönder"}
            </Button>
          </div>
        ) : (
          eligibilityNote()
        )}
      </div>
    </div>
  );
}
