import {
  AtSign,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Play,
  Users,
} from "lucide-react";
import { FooterNavLink } from "@/components/layout/footer-nav-link";
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
        { etiket: LABELS.newArrivals, url: ROUTES.catalog("yeni") },
        { etiket: LABELS.bestSellers, url: ROUTES.catalog("cok-satan") },
        { etiket: LABELS.discountedProducts, url: ROUTES.catalog("indirimli") },
        { etiket: LABELS.brands, url: ROUTES.catalog("markalar") },
      ],
    },
    {
      baslik: LABELS.corporate,
      linkler: [
        { etiket: LABELS.about, url: ROUTES.about },
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

  const displayColumns = (columns.length > 0 ? columns : defaultColumns)
    .map((column) => ({
      ...column,
      linkler: column.linkler.filter((link) => link.url !== ROUTES.blog && link.etiket !== LABELS.blog),
    }))
    .filter((column) => column.linkler.length > 0);

  const socialLinks = [
    { href: ayarlar?.instagramUrl, label: "Instagram", icon: InstagramIcon },
    { href: ayarlar?.facebookUrl, label: "Facebook", icon: Users },
    { href: ayarlar?.twitterUrl, label: "Twitter", icon: AtSign },
    { href: ayarlar?.youtubeUrl, label: "YouTube", icon: Play },
    { href: ayarlar?.linkedinUrl, label: "LinkedIn", icon: Briefcase },
  ].filter((s) => s.href);

  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-5 lg:col-span-2">
          <h3 className="text-lg font-semibold tracking-tight">{config.firmaIsim}</h3>
          {config.ayarlar?.siteAciklama && (
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {config.ayarlar.siteAciklama}
            </p>
          )}
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {ayarlar?.iletisimEmail && (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                {ayarlar.iletisimEmail}
              </li>
            )}
            {ayarlar?.iletisimTelefon && (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                {ayarlar.iletisimTelefon}
              </li>
            )}
            {ayarlar?.iletisimAdres && (
              <li className="flex items-start gap-2.5">
                <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
                  className="inline-flex size-10 items-center justify-center border border-border text-muted-foreground hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
          <form className="flex max-w-sm gap-2" action={ROUTES.contact}>
            <input
              type="email"
              name="email"
              placeholder={LABELS.email}
              className="h-10 flex-1 rounded-[var(--radius-input)] border border-input bg-background px-3 text-sm"
              aria-label={LABELS.email}
            />
            <button type="submit" className="inline-flex h-10 items-center bg-primary px-4 text-sm text-primary-foreground">
              {LABELS.subscribe}
            </button>
          </form>
        </div>

        {displayColumns.map((column) => (
          <div key={column.baslik} className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">{column.baslik}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {column.linkler.map((link) => (
                <li key={`${link.url}-${link.etiket}`}>
                  <FooterNavLink
                    href={link.url}
                    label={link.etiket}
                    phone={ayarlar?.iletisimTelefon}
                    email={ayarlar?.iletisimEmail}
                    className="transition-colors hover:text-foreground"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {paymentLogos.length > 0 && (
        <div className="border-t border-border">
          <div className="container mx-auto flex flex-wrap items-center gap-2 px-4 py-6">
            <p className="mr-2 text-sm text-muted-foreground">{LABELS.paymentMethods}</p>
            {paymentLogos.map((label) => (
              <span key={label} className="border border-border px-3 py-1.5 text-xs">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border py-7 text-center text-sm text-muted-foreground">
        {footer?.copyrightMetni ?? `© ${new Date().getFullYear()} ${config.firmaIsim}. Tüm hakları saklıdır.`}
      </div>
    </footer>
  );
}
