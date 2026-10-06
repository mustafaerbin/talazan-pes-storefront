"use client";

import { motion } from "framer-motion";
import {
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { LABELS } from "@/config/constants";

const FEATURES = [
  { icon: Truck, title: LABELS.fastDelivery, desc: "Hızlı ve güvenilir teslimat" },
  { icon: ShieldCheck, title: LABELS.securePayment, desc: "256-bit SSL güvenli ödeme" },
  { icon: RefreshCcw, title: LABELS.easyReturns, desc: "14 gün içinde kolay iade" },
  { icon: Headphones, title: LABELS.support247, desc: "Her an yanınızdayız" },
  { icon: PackageCheck, title: LABELS.originalProduct, desc: "%100 orijinal ürün garantisi" },
];

export function FeaturesSection() {
  return (
    <section className="rounded-[var(--radius-section)] border border-border bg-card p-8 shadow-premium md:p-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="group flex flex-col items-center text-center"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-card transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-hover">
              <feature.icon className="size-6" />
            </div>
            <h3 className="text-sm font-bold">{feature.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
