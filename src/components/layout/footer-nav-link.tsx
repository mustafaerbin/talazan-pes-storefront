"use client";

import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";

interface FooterNavLinkProps {
  href: string;
  label: string;
  phone?: string;
  email?: string;
  className?: string;
}

export function FooterNavLink({ href, label, phone, email, className }: FooterNavLinkProps) {
  const openContact = useSidePanelStore((s) => s.openContact);

  if (href === ROUTES.contact) {
    return (
      <button type="button" onClick={() => openContact({ phone, email })} className={className}>
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
