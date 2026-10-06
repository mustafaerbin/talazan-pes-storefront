# Talazan Storefront

Next.js 15 tabanlı çok kiracılı (multi-tenant) e-ticaret vitrini. `talazan-pes-server` backend API'si ile entegre çalışır.

## Teknolojiler

- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui bileşenleri
- TanStack Query, React Hook Form, Zod
- Axios, Zustand, Framer Motion, Lucide

## Kurulum

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api` |
| `NEXT_PUBLIC_FIRMA_ID` | Varsayılan firma ID | `1` |
| `NEXT_PUBLIC_SITE_URL` | Site URL (SEO) | `http://localhost:3000` |

Multi-tenant: `?firmaId=123` query parametresi veya `NEXT_PUBLIC_FIRMA_ID`.

## Proje Yapısı

```
src/
├── app/           # Next.js sayfaları (Türkçe rotalar)
├── modules/       # Özellik modülleri (home, catalog, auth, cart...)
├── components/    # UI ve layout bileşenleri
├── providers/     # React context sağlayıcıları
├── hooks/         # Custom hooks + Zustand stores
├── services/      # API servis katmanı
├── api/           # Axios client + interceptors
├── config/        # Env ve sabitler
├── themes/        # Tema motoru (minimal, modern, fashion...)
├── types/         # TypeScript tipleri
├── utils/         # SEO ve yardımcılar
└── styles/        # Global CSS
```

## API Endpoints

Backend: `/api/public/store/**`

- `GET /config?firmaId=` — Mağaza yapılandırması
- `GET /products`, `/categories`, `/brands`, `/search`
- `GET /product/{slug}`, `/pages/{slug}`
- `POST /orders` — Sipariş oluşturma
- `POST /auth/register|login|refresh`
- `GET|PUT /account/profile`, `/addresses`, `/favorites`

## Temalar

Desteklenen temalar: `minimal`, `modern`, `fashion`, `electronics`, `cosmetics`

Aktif tema backend `StoreConfigDto.aktifTemaKodu` üzerinden yüklenir.

## Sayfalar

- `/` — Ana sayfa (dinamik bölümler)
- `/kategori/[slug]`, `/urun/[slug]`, `/ara`
- `/sepet`, `/odeme`
- `/giris`, `/kayit`, `/hesabim`, `/siparisler`, `/favoriler`, `/adresler`
- `/hakkimizda`, `/iletisim`, `/sss`, `/blog`, `/gizlilik`, `/kosullar`

## Geliştirme

```bash
npm run dev    # Geliştirme sunucusu
npm run build  # Production build
npm run start  # Production sunucu
npm run lint   # ESLint
```
