import { apiClient, unwrapData, unwrapList } from "@/api/client";
import type {
  AppPageResponse,
  AppResponse,
  FirmaKategoriDto,
  FirmaMarkaDto,
  FirmaSiparisDto,
  FirmaUrunDto,
  ProductFilters,
  SiteSayfaDto,
  StoreConfigDto,
  StoreSiparisSonucDto,
  StoreUrunSoruDto,
  StoreUrunSoruOlusturDto,
  StoreUrunYorumDto,
  StoreUrunYorumOlusturDto,
  StoreUrunYorumOzetDto,
} from "@/types/api";

const STORE_BASE = "/public/store";

export const storeService = {
  async getConfig(firmaId: number): Promise<StoreConfigDto> {
    const { data } = await apiClient.get<AppResponse<StoreConfigDto>>(`${STORE_BASE}/config`, {
      params: { firmaId },
    });
    return unwrapData(data);
  },

  async getCategories(firmaId: number): Promise<FirmaKategoriDto[]> {
    const { data } = await apiClient.get<AppPageResponse<FirmaKategoriDto[]>>(`${STORE_BASE}/categories`, {
      params: { firmaId },
    });
    return unwrapList(data);
  },

  async getBrands(firmaId: number): Promise<FirmaMarkaDto[]> {
    const { data } = await apiClient.get<AppPageResponse<FirmaMarkaDto[]>>(`${STORE_BASE}/brands`, {
      params: { firmaId },
    });
    return unwrapList(data);
  },

  async getProducts(firmaId: number, filters: ProductFilters = {}): Promise<{
    items: FirmaUrunDto[];
    pageInfo?: AppPageResponse<FirmaUrunDto[]>["pageInfo"];
  }> {
    const { page = 0, size = 12, ...rest } = filters;
    const { data } = await apiClient.get<AppPageResponse<FirmaUrunDto[]>>(`${STORE_BASE}/products`, {
      params: {
        firmaId,
        page,
        size,
        ...rest,
      },
    });
    return {
      items: unwrapList(data),
      pageInfo: data.pageInfo,
    };
  },

  async getProductBySlug(firmaId: number, slug: string): Promise<FirmaUrunDto> {
    const { data } = await apiClient.get<AppResponse<FirmaUrunDto>>(`${STORE_BASE}/product/${slug}`, {
      params: { firmaId },
    });
    return unwrapData(data);
  },

  async getProductVariants(firmaId: number, urunId: number): Promise<FirmaUrunDto[]> {
    const { data } = await apiClient.get<AppPageResponse<FirmaUrunDto[]>>(
      `${STORE_BASE}/products/${urunId}/variants`,
      { params: { firmaId } },
    );
    return unwrapList(data);
  },

  async searchProducts(firmaId: number, q: string, limit = 10): Promise<FirmaUrunDto[]> {
    const { data } = await apiClient.get<AppPageResponse<FirmaUrunDto[]>>(`${STORE_BASE}/search`, {
      params: { firmaId, q, limit },
    });
    return unwrapList(data);
  },

  async getFeaturedProducts(firmaId: number, limit = 10): Promise<FirmaUrunDto[]> {
    const { data } = await apiClient.get<AppPageResponse<FirmaUrunDto[]>>(`${STORE_BASE}/products/featured`, {
      params: { firmaId, limit },
    });
    return unwrapList(data);
  },

  async getPage(firmaId: number, slug: string): Promise<SiteSayfaDto> {
    const { data } = await apiClient.get<AppResponse<SiteSayfaDto>>(`${STORE_BASE}/pages/${slug}`, {
      params: { firmaId },
    });
    return unwrapData(data);
  },

  async previewOrder(order: FirmaSiparisDto): Promise<StoreSiparisSonucDto> {
    const { data } = await apiClient.post<AppResponse<StoreSiparisSonucDto>>(`${STORE_BASE}/orders/preview`, order);
    return unwrapData(data);
  },

  async createOrder(order: FirmaSiparisDto): Promise<StoreSiparisSonucDto> {
    const { data } = await apiClient.post<AppResponse<StoreSiparisSonucDto>>(`${STORE_BASE}/orders`, order);
    return unwrapData(data);
  },

  async trackOrder(payload: { firmaId: number; siparisNo: string; takipToken?: string }): Promise<StoreSiparisSonucDto> {
    const { data } = await apiClient.post<AppResponse<StoreSiparisSonucDto>>(`${STORE_BASE}/orders/track`, payload);
    return unwrapData(data);
  },

  async claimOrder(payload: { firmaId: number; siparisNo: string; takipToken: string }): Promise<void> {
    await apiClient.post(`${STORE_BASE}/orders/claim`, payload);
  },

  async getProductQuestions(firmaId: number, urunId: number): Promise<StoreUrunSoruDto[]> {
    const { data } = await apiClient.get<AppPageResponse<StoreUrunSoruDto[]>>(
      `${STORE_BASE}/products/${urunId}/questions`,
      { params: { firmaId } },
    );
    return unwrapList(data);
  },

  async askProductQuestion(urunId: number, payload: StoreUrunSoruOlusturDto): Promise<StoreUrunSoruDto> {
    const { data } = await apiClient.post<AppResponse<StoreUrunSoruDto>>(
      `${STORE_BASE}/products/${urunId}/questions`,
      payload,
    );
    return unwrapData(data);
  },

  async getProductReviews(firmaId: number, urunId: number): Promise<StoreUrunYorumOzetDto> {
    const { data } = await apiClient.get<AppResponse<StoreUrunYorumOzetDto>>(
      `${STORE_BASE}/products/${urunId}/reviews`,
      { params: { firmaId } },
    );
    return unwrapData(data);
  },

  async createProductReview(urunId: number, payload: StoreUrunYorumOlusturDto): Promise<StoreUrunYorumDto> {
    const { data } = await apiClient.post<AppResponse<StoreUrunYorumDto>>(
      `${STORE_BASE}/products/${urunId}/reviews`,
      payload,
    );
    return unwrapData(data);
  },

  async markReviewHelpful(yorumId: number): Promise<StoreUrunYorumDto> {
    const { data } = await apiClient.post<AppResponse<StoreUrunYorumDto>>(
      `${STORE_BASE}/reviews/${yorumId}/helpful`,
    );
    return unwrapData(data);
  },
};
