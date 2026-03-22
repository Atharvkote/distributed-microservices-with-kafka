import type { CatalogProductListItem, CatalogProductDetailResponse } from '@/api/catalog.api';
import type { UiProduct } from '@/types/commerce';

const PLACEHOLDER = 'https://placehold.co/600x600/e2e8f0/64748b?text=Product';

function vendorIdFromDoc(doc: object): string {
  const v = 'vendor' in doc ? (doc as { vendor?: unknown }).vendor : undefined;
  return typeof v === 'string' ? v : 'vendor';
}

export function mapCatalogListItem(p: CatalogProductListItem): UiProduct {
  const cat =
    typeof p.category === 'object' && p.category && 'name' in p.category
      ? (p.category as { name: string }).name
      : String(p.category ?? 'General');
  const min = p.priceRange?.minPrice ?? 0;
  const max = p.priceRange?.maxPrice;
  return {
    id: p._id,
    name: p.title,
    description: p.description ?? '',
    price: min,
    originalPrice: max && max > min ? max : undefined,
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    category: cat,
    rating: p.avgRating ?? 0,
    reviewCount: p.ratingCount ?? 0,
    vendorId: vendorIdFromDoc(p as object),
    vendorName: 'Seller',
    stock: 0,
    tags: p.tags ?? [],
    status: p.isActive === false ? 'rejected' : 'active',
    createdAt: p.createdAt ?? '',
  };
}

export function mapCatalogDetail(res: CatalogProductDetailResponse): UiProduct {
  const p = res.product;
  const variants = p.variants ?? [];
  const first = variants[0];
  const img = first?.images?.[0]?.url ?? PLACEHOLDER;
  const price = first?.price?.sellingPrice ?? first?.price?.mrp ?? 0;
  const mrp = first?.price?.mrp;
  const cat =
    typeof p.category === 'object' && p.category && 'name' in p.category
      ? (p.category as { name: string }).name
      : String(p.category ?? 'General');

  return {
    id: p._id,
    name: p.title,
    description: p.description ?? '',
    price,
    originalPrice: mrp && mrp > price ? mrp : undefined,
    image: img,
    images: first?.images?.map((i) => i.url) ?? [img],
    category: cat,
    rating: p.avgRating ?? 0,
    reviewCount: p.ratingCount ?? 0,
    vendorId: vendorIdFromDoc(p as object),
    vendorName: 'Seller',
    stock: 0,
    tags: p.tags ?? [],
    status: p.isActive === false ? 'rejected' : 'active',
    createdAt: p.createdAt ?? '',
    defaultVariantId: first?._id,
  };
}
