import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import {
  useVendorInventoryQuery,
  useVendorInventoryAlertsQuery,
  useStockDeltaMutation,
  useBulkStockMutation,
} from '@/hooks/useVendorCatalog';

const InventoryPage: React.FC = () => {
  const { data: rows, isLoading, isError, refetch } = useVendorInventoryQuery();
  const { data: alerts } = useVendorInventoryAlertsQuery();
  const stockDelta = useStockDeltaMutation();
  const bulk = useBulkStockMutation();

  const [deltas, setDeltas] = useState<Record<string, string>>({});

  const bulkPayload = useMemo(() => {
    const list: { variantId: string; delta: number }[] = [];
    for (const [vid, raw] of Object.entries(deltas)) {
      const n = Number(raw);
      if (raw !== '' && Number.isFinite(n) && n !== 0) list.push({ variantId: vid, delta: n });
    }
    return list;
  }, [deltas]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <TableSkeleton rows={10} cols={5} />;

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">Stock adjustments and low-stock alerts</p>
      </div>

      {(alerts ?? []).length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base text-amber-200">Low stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(alerts ?? []).map((a) => (
              <div key={a.variant._id} className="flex justify-between gap-4">
                <span>
                  {a.product.title} — {a.variant.sku}
                </span>
                <span className="text-muted-foreground shrink-0">
                  avail {a.available} / threshold {a.lowStockThreshold}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {list.length === 0 ? (
        <EmptyState type="products" description="No inventory rows yet. Create variants first." />
      ) : (
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">All variants</CardTitle>
            <Button
              size="sm"
              disabled={bulkPayload.length === 0 || bulk.isPending}
              onClick={() =>
                bulk.mutate(bulkPayload, {
                  onSuccess: () => {
                    setDeltas({});
                    void refetch();
                  },
                })
              }
            >
              Apply queued deltas ({bulkPayload.length})
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.map((row) => {
              const vid = row.variant?._id;
              if (!vid) return null;
              const label = `${row.product?.title ?? 'Product'} — ${row.variant?.sku ?? '—'}`;
              return (
                <div
                  key={vid}
                  className="flex flex-col md:flex-row md:items-end gap-3 p-3 rounded-xl border border-border/40 bg-accent/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      stock {row.stock} · reserved {row.reserved} · threshold {row.lowStockThreshold}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Δ</Label>
                      <Input
                        className="w-28 bg-accent/30"
                        type="number"
                        placeholder="±qty"
                        value={deltas[vid] ?? ''}
                        onChange={(e) => setDeltas((prev) => ({ ...prev, [vid]: e.target.value }))}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={stockDelta.isPending || !deltas[vid]}
                      onClick={() => {
                        const d = Number(deltas[vid]);
                        if (!Number.isFinite(d) || d === 0) return;
                        stockDelta.mutate(
                          { variantId: vid, delta: d },
                          {
                            onSuccess: () => {
                              void refetch();
                              setDeltas((prev) => {
                                const next = { ...prev };
                                delete next[vid];
                                return next;
                              });
                            },
                          },
                        );
                      }}
                    >
                      Apply now
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryPage;
