"use client";

import { LABELS, ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
}

export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  return (
    <section className="border-t border-border py-10">
      <div className="max-w-xl">
        <h2 className="text-xl font-semibold tracking-tight">{title ?? LABELS.newsletter}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle ?? LABELS.newsletterDesc}</p>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row" action={ROUTES.contact}>
          <Input type="email" name="email" required placeholder={LABELS.email} aria-label={LABELS.email} />
          <Button type="submit">{LABELS.subscribe}</Button>
        </form>
      </div>
    </section>
  );
}
