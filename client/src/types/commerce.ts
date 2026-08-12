import type { OrderRecord } from '@/api/orders.api';

/** Normalized order row for tables (legacy UI shape). */
export interface UiOrder {
  id: string;
  mongoId: string;
  customerId: string;
  customerName: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
}

export function mapOrderRecord(o: OrderRecord): UiOrder {
  const id = o.orderNumber ?? o._id;
  const addr = o.shippingAddress;
  const shippingAddress = addr
    ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}`
    : '';
  return {
    id,
    mongoId: o._id,
    customerId: String(o.customerId),
    customerName: o.customerName,
    items: (o.items || []).map((i) => ({
      productId: String(i.productId),
      name: i.productTitle ?? 'Product',
      quantity: i.quantity,
      price: i.price,
    })),
    total: o.total,
    status: (o.status || 'PENDING').toLowerCase(),
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '',
    shippingAddress,
  };
}

/** Product card / listing (UI). */
export interface UiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string;
  vendorRating?: number;
  stock: number;
  tags: string[];
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
  /** First variant id when known (detail page / cart). */
  defaultVariantId?: string;
}
