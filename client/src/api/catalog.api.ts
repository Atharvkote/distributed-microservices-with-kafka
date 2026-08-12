import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const products = `${GATEWAY.catalog}/products`;
const categories = `${GATEWAY.catalog}/categories`;
const variants = `${GATEWAY.catalog}/variants`;
const inventoryPath = `${GATEWAY.catalog}/inventory`;

export interface CatalogCategoryRef {
  _id: string;
  name: string;
  slug?: string;
  path?: string;
}

export interface VendorStoreRef {
  _id?: string;
  store_name?: string;
  store_logo?: string;
  ratings?: number;
}

export interface CatalogProductListItem {
  _id: string;
  title: string;
  description?: string;
  brand?: string;
  category?: CatalogCategoryRef | string;
  vendor?: VendorStoreRef | string;
  avgRating?: number;
  ratingCount?: number;
  tags?: string[];
  isActive?: boolean;
  seo?: { slug?: string; metaTitle?: string; metaDescription?: string };
  createdAt?: string;
  updatedAt?: string;
  priceRange?: { minPrice: number; maxPrice: number } | null;
  /** Representative image from lowest-priced active variant (listing). */
  image?: string;
  images?: string[];
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

export interface VendorProductsListResponse {
  data: CatalogProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
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
  inventory?: {
    stock?: number;
    reserved?: number;
    lowStockThreshold?: number;
  } | null;
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

export interface CreateProductBody {
  title: string;
  description: string;
  category: string;
  brand?: string;
  tags?: string[];
  seo?: { metaTitle?: string; metaDescription?: string };
}

export interface UpdateProductBody {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  isActive?: boolean;
  seo?: { metaTitle?: string; metaDescription?: string };
}

export interface CreateVariantBody {
  product: string;
  sku: string;
  attributes?: Record<string, string>;
  price: { mrp: number; sellingPrice: number; discountPercent?: number };
  weight?: { value?: number; unit?: 'g' | 'kg' };
}

export interface UpdateVariantBody {
  attributes?: Record<string, string>;
  price?: { mrp?: number; sellingPrice?: number; discountPercent?: number };
  weight?: { value?: number; unit?: 'g' | 'kg' };
  isActive?: boolean;
}

export interface InventoryRow {
  _id?: string;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  variant?: { _id: string; sku: string };
  product?: { title: string };
}

export interface InventoryAlertRow {
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  available: number;
  variant: { _id: string; sku: string };
  product: { title: string };
}

export const catalogApi = {
  listProducts: (params?: {
    page?: number;
    limit?: number;
    /** Comma-separated category ObjectIds */
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    vendor?: string;
  }) => apiClient.get<CatalogProductsListResponse>(`${products}/`, { params }),

  getProduct: (id: string) =>
    apiClient.get<CatalogProductDetailResponse>(`${products}/${id}`),

  listCategories: () => apiClient.get<{ categories: CategoryDto[] }>(`${categories}/`),

  listVendorProducts: (params?: { page?: number; limit?: number; isActive?: 'true' | 'false' }) =>
    apiClient.get<VendorProductsListResponse>(`${products}/vendor/me`, { params }),

  getVendorProduct: (id: string) =>
    apiClient.get<CatalogProductDetailResponse>(`${products}/vendor/${id}`),

  createProduct: (body: CreateProductBody) =>
    apiClient.post<{ message: string; product: CatalogProductListItem }>(`${products}/`, body),

  updateProduct: (id: string, body: UpdateProductBody) =>
    apiClient.put<{ message: string; product: CatalogProductListItem }>(`${products}/${id}`, body),

  deleteProduct: (id: string) =>
    apiClient.delete<{ message: string }>(`${products}/${id}`),

  getVendorVariants: (productId: string) =>
    apiClient.get<{ variants: CatalogVariant[] }>(`${variants}/vendor/product/${productId}`),

  /** multipart/form-data: fields + optional files under `images` */
  createVariant: (formData: FormData) =>
    apiClient.post<{ message: string; variant: CatalogVariant }>(`${variants}/`, formData),

  updateVariant: (id: string, formData: FormData) =>
    apiClient.put<{ message: string; variant: CatalogVariant }>(`${variants}/${id}`, formData),

  deleteVariant: (id: string) =>
    apiClient.delete<{ message: string }>(`${variants}/${id}`),

  listInventory: () => apiClient.get<InventoryRow[]>(`${inventoryPath}/`),

  inventoryAlerts: (params?: { threshold?: number }) =>
    apiClient.get<{ alerts: InventoryAlertRow[] }>(`${inventoryPath}/alerts`, { params }),

  updateStock: (variantId: string, delta: number) =>
    apiClient.put<{ message: string; inventory: Record<string, unknown> }>(
      `${inventoryPath}/${variantId}`,
      { delta }
    ),

  bulkUpdateStock: (updates: { variantId: string; delta: number }[]) =>
    apiClient.patch<{ message: string; results: unknown[] }>(`${inventoryPath}/bulk`, {
      updates,
    }),
};
