"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { storeService } from "@/services/store.service";
import { toast } from "sonner";

interface ProductQuestionsSectionProps {
  productId: number;
  productName: string;
}

function formatQuestionDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProductQuestionsSection({ productId, productName }: ProductQuestionsSectionProps) {
  const firmaId = useFirmaId();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [guestName, setGuestName] = useState("");

  const queryKey = ["product-questions", firmaId, productId] as const;

  const { data: questions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => storeService.getProductQuestions(firmaId, productId),
    enabled: firmaId > 0 && productId > 0,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const loggedInName = [user?.ad, user?.soyad].filter(Boolean).join(" ").trim();
      return storeService.askProductQuestion(productId, {
        firmaId,
        soru: draft.trim(),
        musteriAdi: loggedInName || guestName.trim() || undefined,
        musteriEmail: user?.email,
      });
    },
    onSuccess: () => {
      setDraft("");
      toast.success("Sorunuz alındı. Satıcı yanıtladığında burada görünecek.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const submitQuestion = () => {
    const text = draft.trim();
    if (text.length < 10) {
      toast.error("Soru en az 10 karakter olmalıdır.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-border/70 bg-secondary/20 p-5">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <MessageCircleQuestion className="size-4 text-primary" />
          Ürün hakkında soru sorun
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          {productName} ile ilgili merak ettiklerinizi yazın. Yanıtlar bu alanda listelenir.
        </p>
        {!user && (
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Adınız (isteğe bağlı)"
            className="mb-3 bg-card"
            maxLength={80}
          />
        )}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Örn: Bu ürün hangi ölçülerde?"
          className="min-h-[88px] resize-none bg-card"
          maxLength={2000}
        />
        <Button
          type="button"
          className="mt-3 gap-2"
          size="sm"
          onClick={submitQuestion}
          disabled={!draft.trim() || mutation.isPending}
        >
          <Send className="size-4" />
          {mutation.isPending ? "Gönderiliyor…" : "Soruyu gönder"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Sorular yükleniyor…</p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bu ürün için henüz soru sorulmamış.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((item) => (
            <li key={item.id} className="rounded-[var(--radius-card)] border border-border/70 bg-card p-5 shadow-card">
              <p className="text-xs text-muted-foreground">
                {item.musteriAdi || "Mağaza müşterisi"}
                {item.soruTarihi ? ` · ${formatQuestionDate(item.soruTarihi)}` : ""}
              </p>
              <p className="mt-2 font-medium">{item.soru}</p>
              {item.cevap ? (
                <div className="mt-4 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm">
                  <p className="text-xs font-semibold text-primary">Satıcı cevabı</p>
                  <p className="mt-1 leading-relaxed text-foreground/90">{item.cevap}</p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">Yanıt bekleniyor…</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
