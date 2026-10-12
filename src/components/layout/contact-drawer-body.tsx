"use client";

import { Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LABELS } from "@/config/constants";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { ContactForm } from "@/modules/content/contact-form";

interface ContactDrawerBodyProps {
  onClose: () => void;
}

export function ContactDrawerBody({ onClose }: ContactDrawerBodyProps) {
  const contact = useSidePanelStore((s) => s.contact);
  const phone = contact?.phone?.trim();
  const email = contact?.email?.trim();

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Phone className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold tracking-tight">{LABELS.contact}</h2>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-primary/10 text-primary hover:bg-primary/15"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X className="size-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {(phone || email) && (
          <ul className="mb-6 space-y-3">
            {phone && (
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border/70 bg-card px-4 py-3 text-sm font-medium shadow-card transition-colors hover:border-primary/30"
                >
                  <Phone className="size-4 shrink-0 text-primary" />
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border/70 bg-card px-4 py-3 text-sm font-medium shadow-card transition-colors hover:border-primary/30"
                >
                  <Mail className="size-4 shrink-0 text-primary" />
                  {email}
                </a>
              </li>
            )}
          </ul>
        )}

        <h3 className="mb-4 text-base font-bold">{LABELS.sendMessage}</h3>
        <ContactForm embedded />
      </div>
    </>
  );
}
