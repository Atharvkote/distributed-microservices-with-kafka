import type { CatalogProductListItem, CatalogProductDetailResponse } from '@/api/catalog.api';
import type { UiProduct } from '@/types/commerce';

const PLACEHOLDER = 'https://placehold.co/600x600/e2e8f0/64748b?text=Product';

function vendorIdFromDoc(doc: object): string {
  const v = 'vendor' in doc ? (doc as { vendor?: unknown }).vendor : undefined;
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && '_id' in (v as object)) {
    return String((v as { _id: unknown })._id);
  }
  return '';
}

function vendorMetaFromProduct(p: CatalogProductListItem) {
  const v = p.vendor;
  if (v && typeof v === 'object' && 'store_name' in v) {
    return {
      vendorName: (v as { store_name?: string }).store_name || 'Seller',
      vendorLogo: (v as { store_logo?: string }).store_logo || undefined,
      vendorRating:
        typeof (v as { ratings?: number }).ratings === 'number'
          ? (v as { ratings: number }).ratings
          : undefined,
    };
  }
  return { vendorName: 'Seller' as const, vendorLogo: undefined, vendorRating: undefined };
}

export function mapCatalogListItem(p: CatalogProductListItem): UiProduct {
  const cat =
    typeof p.category === 'object' && p.category && 'name' in p.category
      ? (p.category as { name: string }).name
      : String(p.category ?? 'General');
  const min = p.priceRange?.minPrice ?? 0;
  const max = p.priceRange?.maxPrice;
  const listImg = p.image || p.images?.[0] || PLACEHOLDER;
  const { vendorName, vendorLogo, vendorRating } = vendorMetaFromProduct(p);
  return {
    id: p._id,
    name: p.title,
    description: p.description ?? '',
    price: min,
    originalPrice: max && max > min ? max : undefined,
    image: listImg,
    images: p.images?.length ? p.images : [listImg],
    category: cat,
    rating: p.avgRating ?? 0,
    reviewCount: p.ratingCount ?? 0,
    vendorId: vendorIdFromDoc(p as object),
    vendorName,
    vendorLogo,
    vendorRating,
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
  const { vendorName, vendorLogo, vendorRating } = vendorMetaFromProduct(p);

  const allUrls = variants.flatMap((v) => (v.images ?? []).map((i) => i.url).filter(Boolean));

  return {
    id: p._id,
    name: p.title,
    description: p.description ?? '',
    price,
    originalPrice: mrp && mrp > price ? mrp : undefined,
    image: img,
    images: allUrls.length ? allUrls : [img],
    category: cat,
    rating: p.avgRating ?? 0,
    reviewCount: p.ratingCount ?? 0,
    vendorId: vendorIdFromDoc(p as object),
    vendorName,
    vendorLogo,
    vendorRating,
    stock: 0,
    tags: p.tags ?? [],
    status: p.isActive === false ? 'rejected' : 'active',
    createdAt: p.createdAt ?? '',
    defaultVariantId: first?._id,
  };
}
