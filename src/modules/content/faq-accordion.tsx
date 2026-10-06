"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  soru: string;
  cevap: string;
}

const DEFAULT_FAQ: FaqItem[] = [
  {
    soru: "Siparişim ne zaman kargoya verilir?",
    cevap: "Stoktaki ürünler için siparişler genellikle 1-2 iş günü içinde kargoya verilir.",
  },
  {
    soru: "İade ve değişim nasıl yapılır?",
    cevap: "Teslimattan itibaren 14 gün içinde iade talebi oluşturabilirsiniz.",
  },
  {
    soru: "Ödeme seçenekleri nelerdir?",
    cevap: "Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz.",
  },
  {
    soru: "Kargo ücreti var mı?",
    cevap: "Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.",
  },
];

function parseFaqContent(icerik?: string): FaqItem[] {
  if (!icerik) return DEFAULT_FAQ;
  try {
    const parsed = JSON.parse(icerik) as FaqItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // HTML or plain text fallback
  }
  return DEFAULT_FAQ;
}

export function FaqAccordion({ content }: { content?: string }) {
  const items = parseFaqContent(content);

  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item, index) => (
        <Accordion.Item
          key={item.soru}
          value={`item-${index}`}
          className="overflow-hidden rounded-xl border border-border/60"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left font-medium hover:bg-muted/50">
              {item.soru}
              <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className={cn("px-5 pb-4 text-sm text-muted-foreground leading-relaxed")}>
              {item.cevap}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
