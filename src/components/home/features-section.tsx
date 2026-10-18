"use client";

import { RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { LABELS } from "@/config/constants";

const FEATURES = [
  { icon: Truck, title: LABELS.fastDelivery, desc: "Siparişleriniz özenle hazırlanır ve kargoya verilir." },
  { icon: ShieldCheck, title: LABELS.securePayment, desc: "Ödeme bilgileriniz güvenli altyapı ile iletilir." },
  { icon: RefreshCcw, title: LABELS.easyReturns, desc: "İade ve değişim süreçleri sipariş detayından takip edilir." },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-border">
      <div className="grid gap-8 py-10 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex gap-3">
            <feature.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
