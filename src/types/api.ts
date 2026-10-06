export interface AppResponse<T> {
  status: number;
  data?: T;
  errorMessage?: string;
  infoMessage?: string;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export interface AppPageResponse<T> extends AppResponse<T> {
  pageInfo?: PageInfo;
}

export interface FirmaWebsiteAyarDto {
  id?: number;
  firmaId?: number;
  firmaIsim?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  aktifTemaKodu?: string;
  siteBaslik?: string;
  siteAciklama?: string;
  domain?: string;
  iletisimEmail?: string;
  iletisimTelefon?: string;
  iletisimAdres?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  whatsappNo?: string;
  mevcutKategorileriKullan?: string;
}

export interface SiteHeaderDto {
  id?: number;
  firmaId?: number;
  logoUrl?: string;
  aramaAktif?: boolean;
  sepetAktif?: boolean;
  hesapAktif?: boolean;
  duyuruMetni?: string;
  ekAyarlar?: string;
}

export interface SiteFooterDto {
  id?: number;
  firmaId?: number;
  copyrightMetni?: string;
  kolonlar?: string;
  odemeLogolari?: string;
}

export interface SiteSeoDto {
  id?: number;
  firmaId?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

export interface SiteMenuDto {
  id?: number;
  firmaId?: number;
  kod?: string;
  isim?: string;
  icerik?: string;
}

export interface StoreConfigDto {
  firmaId: number;
  firmaIsim: string;
  ayarlar?: FirmaWebsiteAyarDto;
  aktifTemaKodu?: string;
  header?: SiteHeaderDto;
  footer?: SiteFooterDto;
  seo?: SiteSeoDto;
  menuler?: SiteMenuDto[];
}

export interface FirmaKategoriDto {
  id: number;
  firmaId?: number;
  firmaIsmi?: string;
  isim: string;
  slug?: string;
  parent?: FirmaKategoriDto;
}

export interface FirmaMarkaDto {
  id: number;
  firmaId?: number;
  isim: string;
  slug?: string;
}

export interface FirmaUrunDto {
  id: number;
  firmaId?: number;
  firmaIsim?: string;
  satisTutari?: number;
  listeTutari?: number;
  alisTutari?: number;
  paraBirimi?: string;
  kdvOrani?: number;
  isim: string;
  slug?: string;
  aciklama?: string;
  urunKodu?: string;
  barkodNo?: string;
  stokKodu?: string;
  stokMiktari?: number;
  stokBirimi?: string;
  durum?: string;
  resim?: string;
  resimler?: string[];
  firmaMarkaIsim?: string;
  firmaMarkaId?: number;
  firmaKategoriIsim?: string;
  firmaKategoriTamIsim?: string;
  firmaKategoriId?: number;
  beden?: string;
  renk?: string;
  varyantBilgisi?: string;
}

export interface SiteSayfaDto {
  id?: number;
  firmaId?: number;
  slug: string;
  baslik: string;
  icerik?: string;
  metaTitle?: string;
  metaDescription?: string;
  yayinda?: boolean;
}

export interface SiteMusteriRegisterDto {
  firmaId: number;
  email: string;
  parola: string;
  ad: string;
  soyad: string;
  telefon?: string;
}

export interface SiteMusteriLoginDto {
  firmaId: number;
  email: string;
  parola: string;
}

export interface SiteMusteriAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  musteriId: number;
  firmaId: number;
  email: string;
  ad: string;
  soyad: string;
}

export interface SiteMusteriDto {
  id?: number;
  firmaId?: number;
  email?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
}

export interface SiteMusteriAdresDto {
  id?: number;
  musteriId?: number;
  firmaId?: number;
  baslik?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
  il?: string;
  ilce?: string;
  mahalle?: string;
  adresSatiri?: string;
  postaKodu?: string;
  varsayilan?: boolean;
}

export interface FirmaSiparisUrunDto {
  id?: number;
  firmaSiparisId?: number;
  firmaUrunId: number;
  adet: number;
  urunIsim?: string;
  urunKodu?: string;
  stokKodu?: string;
  tutar?: number;
  indirimTutar?: number;
  satisTutar?: number;
  barkodNo?: string;
  resim?: string;
  kdvOrani?: number;
}

export interface FirmaSiparisAdresDto {
  id?: number;
  firmaSiparisId?: number;
  isim?: string;
  soyisim?: string;
  adres?: string;
  fulladres?: string;
  il?: string;
  ilce?: string;
  mahalle?: string;
  postaKodu?: string;
  mail?: string;
  telefon?: string;
  adresTipi?: string;
}

export interface FirmaSiparisDto {
  id?: number;
  firmaIsim?: string;
  firmaId: number;
  siparisNo?: string;
  musteriAdi?: string;
  musteriSoyadi?: string;
  musteriTc?: string;
  musteriAdiSoyadi?: string;
  tutar?: number;
  indirimTutar?: number;
  satisTutar?: number;
  siparisDurum?: string;
  siparisFaturaDurum?: string;
  faturaLink?: string;
  siparisTarihi?: string;
  kargoFirmasi?: string;
  kargoTakipKodu?: string;
  platform?: string;
  firmaSiparisUrunDtoList?: FirmaSiparisUrunDto[];
  adresBilgileri?: FirmaSiparisAdresDto;
}

export interface ProductFilters {
  kategoriId?: number;
  markaId?: number;
  arama?: string;
  minFiyat?: number;
  maxFiyat?: number;
  stoktaVar?: boolean;
  siralama?: string;
  page?: number;
  size?: number;
}

export interface CartItem {
  urunId: number;
  isim: string;
  slug?: string;
  resim?: string;
  birimFiyat: number;
  adet: number;
  stokMiktari?: number;
  listeTutari?: number;
  renk?: string;
  beden?: string;
}

export interface LocalOrder {
  siparisNo: string;
  tarih: string;
  tutar: number;
  urunSayisi: number;
  durum: string;
}

export type ThemeCode = "minimal" | "modern" | "fashion" | "electronics" | "cosmetics";

export type HomeSectionType =
  | "hero"
  | "featured"
  | "categories"
  | "brands"
  | "banner"
  | "newsletter"
  | "product_carousel"
  | "features"
  | "promotion";

export type ProductCarouselSource =
  | "featured"
  | "new_arrivals"
  | "best_sellers"
  | "discounted"
  | "trending"
  | "recommended"
  | "flash_sale";

export interface HeroSlide {
  baslik: string;
  altBaslik?: string;
  ctaMetin?: string;
  ctaUrl?: string;
  ikinciCtaMetin?: string;
  ikinciCtaUrl?: string;
  resimUrl?: string;
  arkaPlan?: string;
}

export interface PromotionCard {
  baslik: string;
  altBaslik?: string;
  ctaMetin?: string;
  url?: string;
  resimUrl?: string;
  gradient?: string;
}

export interface HomeSection {
  id: string;
  type: HomeSectionType;
  baslik?: string;
  altBaslik?: string;
  aktif: boolean;
  siraNo: number;
  ayarlar?: {
    source?: ProductCarouselSource;
    limit?: number;
    slides?: HeroSlide[];
    campaigns?: PromotionCard[];
    promotions?: PromotionCard[];
    [key: string]: unknown;
  };
}

export interface HomeProductPools {
  featured: FirmaUrunDto[];
  newArrivals: FirmaUrunDto[];
  bestSellers: FirmaUrunDto[];
  discounted: FirmaUrunDto[];
  trending: FirmaUrunDto[];
  recommended: FirmaUrunDto[];
  flashSale: FirmaUrunDto[];
}

export interface FooterColumn {
  baslik: string;
  linkler: { etiket: string; url: string }[];
}

export interface StoreUrunSoruDto {
  id: number;
  musteriAdi?: string;
  soru?: string;
  cevap?: string;
  soruTarihi?: string;
  cevapTarihi?: string;
  cevaplandi?: boolean;
}

export interface StoreUrunSoruOlusturDto {
  firmaId: number;
  soru: string;
  musteriAdi?: string;
  musteriEmail?: string;
}
