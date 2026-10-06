import Link from "next/link";
import {
  AtSign,
  Briefcase,
  Camera,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Play,
  Smartphone,
  Truck,
  Users,
} from "lucide-react";
import { LABELS, ROUTES } from "@/config/constants";
import type { FooterColumn, StoreConfigDto } from "@/types/api";

interface SiteFooterProps {
  config: StoreConfigDto;
}

function parseFooterColumns(raw?: string): FooterColumn[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FooterColumn[];
  } catch {
    return [];
  }
}

function parsePaymentLogos(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[] | { logos?: string[] };
    return Array.isArray(parsed) ? parsed : parsed.logos ?? [];
  } catch {
    return [];
  }
}

const PAYMENT_LABELS = ["Visa", "Mastercard", "Troy", "Amex"];
const SHIPPING_LABELS = ["Yurtiçi", "Aras", "MNG", "Sürat"];

export function SiteFooter({ config }: SiteFooterProps) {
  const footer = config.footer;
  const ayarlar = config.ayarlar;
  const columns = parseFooterColumns(footer?.kolonlar);
  const paymentLogos = parsePaymentLogos(footer?.odemeLogolari);

  const defaultColumns: FooterColumn[] = [
    {
      baslik: LABELS.categories,
      linkler: [
        { etiket: LABELS.search, url: ROUTES.search },
        { etiket: LABELS.newArrivals, url: `${ROUTES.search}?sort=id,desc` },
        { etiket: LABELS.bestSellers, url: ROUTES.search },
      ],
    },
    {
      baslik: LABELS.corporate,
      linkler: [
        { etiket: LABELS.about, url: ROUTES.about },
        { etiket: LABELS.blog, url: ROUTES.blog },
        { etiket: LABELS.contact, url: ROUTES.contact },
      ],
    },
    {
      baslik: LABELS.customerService,
      linkler: [
        { etiket: LABELS.faq, url: ROUTES.faq },
        { etiket: LABELS.orderTracking, url: ROUTES.orders },
        { etiket: LABELS.helpCenter, url: ROUTES.faq },
      ],
    },
    {
      baslik: "Yasal",
      linkler: [
        { etiket: LABELS.privacy, url: ROUTES.privacy },
        { etiket: LABELS.terms, url: ROUTES.terms },
      ],
    },
  ];

  const displayColumns = columns.length > 0 ? columns : defaultColumns;

  const socialLinks = [
    { href: ayarlar?.instagramUrl, label: "Instagram", icon: Camera },
    { href: ayarlar?.facebookUrl, label: "Facebook", icon: Users },
    { href: ayarlar?.twitterUrl, label: "Twitter", icon: AtSign },
    { href: ayarlar?.youtubeUrl, label: "YouTube", icon: Play },
    { href: ayarlar?.linkedinUrl, label: "LinkedIn", icon: Briefcase },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-6 lg:col-span-2">
          <h3 className="text-2xl font-extrabold tracking-tight">{config.firmaIsim}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {config.ayarlar?.siteAciklama ??
              "Premium alışveriş deneyimi, güvenli ödeme ve hızlı teslimat ile yanınızdayız."}
          </p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {ayarlar?.iletisimEmail && (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                {ayarlar.iletisimEmail}
              </li>
            )}
            {ayarlar?.iletisimTelefon && (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                {ayarlar.iletisimTelefon}
              </li>
            )}
            {ayarlar?.iletisimAdres && (
              <li className="flex items-start gap-2.5">
                <Globe className="mt-0.5 size-4 shrink-0 text-primary" />
                {ayarlar.iletisimAdres}
              </li>
            )}
          </ul>
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-hover"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
          <div className="rounded-[var(--radius-card)] border border-border bg-secondary/50 p-5 shadow-card">
            <p className="text-sm font-bold">{LABELS.newsletter}</p>
            <p className="mt-1 text-xs text-muted-foreground">{LABELS.newsletterDesc}</p>
            <form className="mt-4 flex gap-2" action={ROUTES.contact}>
              <input
                type="email"
                name="email"
                placeholder={LABELS.email}
                className="h-10 flex-1 rounded-[var(--radius-input)] border border-input bg-card px-3 text-sm shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-label={LABELS.email}
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-[var(--radius-btn)] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
              >
                {LABELS.subscribe}
              </button>
            </form>
          </div>
        </div>

        {displayColumns.map((column) => (
          <div key={column.baslik} className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">{column.baslik}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {column.linkler.map((link) => (
                <li key={`${link.url}-${link.etiket}`}>
                  <Link
                    href={link.url}
                    className="transition-colors hover:text-primary"
                  >
                    {link.etiket}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-secondary/30">
        <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-bold">
              <Smartphone className="size-4 text-primary" />
              {LABELS.mobileApps}
            </p>
            <div className="flex gap-2.5">
              <span className="rounded-[var(--radius-btn)] border border-border bg-card px-4 py-2.5 text-xs font-medium shadow-card">
                App Store
              </span>
              <span className="rounded-[var(--radius-btn)] border border-border bg-card px-4 py-2.5 text-xs font-medium shadow-card">
                Google Play
              </span>
            </div>
          </div>
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-bold">
              <CreditCard className="size-4 text-primary" />
              {LABELS.paymentMethods}
            </p>
            <div className="flex flex-wrap gap-2">
              {(paymentLogos.length ? paymentLogos : PAYMENT_LABELS).map((label) => (
                <span
                  key={label}
                  className="rounded-[var(--radius-btn)] border border-border bg-card px-3.5 py-2 text-xs font-medium shadow-card"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-bold">
              <Truck className="size-4 text-primary" />
              {LABELS.shippingPartners}
            </p>
            <div className="flex flex-wrap gap-2">
              {SHIPPING_LABELS.map((label) => (
                <span
                  key={label}
                  className="rounded-[var(--radius-btn)] border border-border bg-card px-3.5 py-2 text-xs font-medium shadow-card"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-7 text-center text-sm text-muted-foreground">
        {footer?.copyrightMetni ?? `© ${new Date().getFullYear()} ${config.firmaIsim}. Tüm hakları saklıdır.`}
      </div>
    </footer>
  );
}
