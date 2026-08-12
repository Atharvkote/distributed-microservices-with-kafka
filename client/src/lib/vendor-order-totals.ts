import type { OrderRecord } from '@/api/orders.api';

/** Unit line subtotal for this vendor's SKUs on an order (orders-service stores unit `price`). */
export function vendorLinesSubtotal(order: OrderRecord, vendorId: string): number {
  const lines = (order.items ?? []).filter(
    (i) => String((i as { vendorId?: string }).vendorId ?? '') === vendorId,
  );
  return lines.reduce((s, i) => s + i.price * i.quantity, 0);
}

/** Revenue attributed to this vendor; falls back to full order total if line items lack `vendorId`. */
export function vendorAttributedTotal(order: OrderRecord, vendorId: string | null): number {
  if (!vendorId) return order.total;
  const sub = vendorLinesSubtotal(order, vendorId);
  return sub > 0 ? sub : order.total;
}

export function vendorOrdersSubtotal(orders: OrderRecord[], vendorId: string | null): number {
  return orders.reduce((s, o) => s + vendorAttributedTotal(o, vendorId), 0);
}

export function vendorOrdersToTrendData(orders: OrderRecord[], vendorId: string | null) {
  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(label) ?? { revenue: 0, orders: 0 };
    cur.revenue += vendorAttributedTotal(o, vendorId);
    cur.orders += 1;
    map.set(label, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({
      label,
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
      visitors: 0,
    }));
}
