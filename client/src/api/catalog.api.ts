import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const products = `${GATEWAY.catalog}/products`;
const categories = `${GATEWAY.catalog}/categories`;

export interface CatalogCategoryRef {
  _id: string;
  name: string;
  slug?: string;
  path?: string;
}

export interface CatalogProductListItem {
  _id: string;
  title: string;
  description?: string;
  brand?: string;
  category?: CatalogCategoryRef | string;
  avgRating?: number;
  ratingCount?: number;
  tags?: string[];
  isActive?: boolean;
  seo?: { slug?: string; metaTitle?: string; metaDescription?: string };
  createdAt?: string;
  updatedAt?: string;
  priceRange?: { minPrice: number; maxPrice: number } | null;
}

export interface CatalogProductsListResponse {
  data: CatalogProductListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CatalogVariant {
  _id: string;
  sku?: string;
  attributes?: Record<string, string>;
  price?: { mrp?: number; sellingPrice?: number; discountPercent?: number };
  images?: Array<{ url: string; alt?: string }>;
  isActive?: boolean;
}

export interface CatalogProductDetailResponse {
  product: CatalogProductListItem & { variants?: CatalogVariant[] };
}

export interface CategoryDto {
  _id: string;
  name: string;
  slug?: string;
  parent?: string | null;
  isActive?: boolean;
}

export const catalogApi = {
  listProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => apiClient.get<CatalogProductsListResponse>(`${products}/`, { params }),

  getProduct: (id: string) =>
    apiClient.get<CatalogProductDetailResponse>(`${products}/${id}`),

  listCategories: () =>
    apiClient.get<{ categories: CategoryDto[] }>(`${categories}/`),

  getVendorProduct: (id: string) =>
    apiClient.get<CatalogProductDetailResponse>(`${products}/vendor/${id}`),
};
