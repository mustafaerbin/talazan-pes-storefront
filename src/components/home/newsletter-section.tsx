"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABELS } from "@/config/constants";
import { toast } from "sonner";

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
}

export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[var(--radius-section)] border border-border bg-card p-8 shadow-premium md:p-14"
    >
      <div className="gradient-primary-subtle pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-card">
          <Sparkles className="size-6" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {title ?? LABELS.newsletter}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          {subtitle ?? LABELS.newsletterDesc}
        </p>
        <form
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Bülten aboneliğiniz alındı");
          }}
        >
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              required
              placeholder={LABELS.email}
              className="h-12 bg-card pl-11"
              aria-label={LABELS.email}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 gap-2 px-8">
            {LABELS.subscribe}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </motion.section>
  );
}
