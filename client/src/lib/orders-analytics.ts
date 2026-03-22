import type { OrderRecord } from '@/api/orders.api';

export function ordersToTrendData(orders: OrderRecord[]) {
  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(label) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.total;
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
