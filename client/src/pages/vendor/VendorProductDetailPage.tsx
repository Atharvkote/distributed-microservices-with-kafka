import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import { vendorPaths } from '@/lib/vendor-paths';
import {
  useVendorProductQuery,
  useCreateVariantMutation,
  useDeleteVariantMutation,
  useStockDeltaMutation,
  useUpdateProductMutation,
  useUpdateVariantMutation,
} from '@/hooks/useVendorCatalog';
import type { CatalogVariant } from '@/api/catalog.api';
import { toast } from 'sonner';

const VARIANT_PLACEHOLDER = 'https://placehold.co/160x160/e2e8f0/64748b?text=Variant';

function categoryLabel(cat: unknown): string {
  if (cat && typeof cat === 'object' && 'name' in cat) return String((cat as { name: string }).name);
  return typeof cat === 'string' ? cat : '—';
}

const VendorProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data, isLoading, isError, refetch } = useVendorProductQuery(productId);
  const updateProduct = useUpdateProductMutation();
  const updateVariant = useUpdateVariantMutation();
  const createVariant = useCreateVariantMutation();
  const delVariant = useDeleteVariantMutation();
  const stockDelta = useStockDeltaMutation();

  const [titleDraft, setTitleDraft] = useState('');
  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState('');
  const [selling, setSelling] = useState('');
  const [deltaByVariant, setDeltaByVariant] = useState<Record<string, string>>({});

  const product = data?.product;
  const variants: CatalogVariant[] = product?.variants ?? [];

  React.useEffect(() => {
    if (product?.title) setTitleDraft(product.title);
  }, [product?.title]);

  if (isError || !productId) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (isLoading || !product) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  const onSaveProduct = () => {
    updateProduct.mutate(
      {
        id: productId,
        body: { title: titleDraft.trim() || undefined },
      },
      { onSuccess: () => toast.success('Title updated') },
    );
  };

  const onAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(mrp);
    const s = Number(selling);
    if (!sku.trim() || !Number.isFinite(m) || !Number.isFinite(s)) return;
    createVariant.mutate(
      {
        body: {
          product: productId,
          sku: sku.trim(),
          price: { mrp: m, sellingPrice: s },
        },
      },
      {
        onSuccess: () => {
          void refetch();
          setSku('');
          setMrp('');
          setSelling('');
        },
      },
    );
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to={vendorPaths.products}>
            <Button variant="outline" size="icon" className="border-border/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage listing and variants</p>
          </div>
        </div>
        <Button type="button" variant="outline" className="border-border/50 shrink-0" asChild>
          <Link to={vendorPaths.productEdit(productId)}>
            <Pencil className="h-4 w-4 mr-2" />
            Full edit
          </Link>
        </Button>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Category</span>
            <Badge variant="secondary">{categoryLabel(product.category)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {product.description || 'No description yet. Add one from the edit page.'}
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="space-y-2 flex-1">
              <Label>Title</Label>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="bg-accent/30 border-border/50"
              />
            </div>
            <Button
              type="button"
              onClick={onSaveProduct}
              disabled={updateProduct.isPending || titleDraft === product.title}
            >
              Save title
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={product.isActive !== false}
              onCheckedChange={(checked) => {
                updateProduct.mutate(
                  { id: productId, body: { isActive: checked } },
                  { onSuccess: () => toast.success('Status updated') },
                );
              }}
              disabled={updateProduct.isPending}
            />
            <span className="text-sm text-muted-foreground">Active in catalog</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> New variant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddVariant} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} className="bg-accent/30" />
            </div>
            <div className="space-y-2">
              <Label>MRP</Label>
              <Input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="bg-accent/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Selling price</Label>
              <Input
                type="number"
                value={selling}
                onChange={(e) => setSelling(e.target.value)}
                className="bg-accent/30"
              />
            </div>
            <Button type="submit" disabled={createVariant.isPending}>
              Add variant
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Variants & stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants yet.</p>
          ) : (
            variants.map((v) => {
              const stock = v.inventory?.stock ?? 0;
              const vid = v._id;
              const deltaStr = deltaByVariant[vid] ?? '';
              const active = v.isActive !== false;
              const attrs = v.attributes ?? {};
              return (
                <div key={vid}>
                  <div className="flex flex-col gap-4 p-3 rounded-lg border border-border/40 bg-accent/5">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <img
                          src={(v.images ?? [])[0]?.url || VARIANT_PLACEHOLDER}
                          alt={v.sku || 'Variant image'}
                          className="h-20 w-20 rounded-lg object-cover border border-border/40 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="font-mono text-sm">{v.sku}</div>
                          <div className="text-xs text-muted-foreground">
                            MRP {v.price?.mrp ?? '—'} · Sell {v.price?.sellingPrice ?? '—'} · Stock {stock}
                            {!active ? ' · inactive' : ''}
                          </div>
                          {Object.keys(attrs).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(attrs).map(([k, val]) => (
                                <Badge key={k} variant="outline" className="text-[10px] font-normal">
                                  {k}: {val}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(v.images ?? []).length > 1 && (
                            <div className="flex flex-wrap gap-1.5">
                              {(v.images ?? []).slice(1).map((im, i) => (
                                <img
                                  key={`${im.url}-${i}`}
                                  src={im.url}
                                  alt=""
                                  className="h-10 w-10 rounded object-cover border border-border/30"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={active}
                            disabled={updateVariant.isPending}
                            onCheckedChange={(checked) => {
                              updateVariant.mutate(
                                { id: vid, productId, body: { isActive: checked } },
                                { onSuccess: () => void refetch() },
                              );
                            }}
                          />
                          <span className="text-xs text-muted-foreground">Active</span>
                        </div>
                        <Input
                          type="number"
                          placeholder="Δ stock"
                          className="w-28 bg-accent/30"
                          value={deltaStr}
                          onChange={(e) =>
                            setDeltaByVariant((prev) => ({ ...prev, [vid]: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={stockDelta.isPending || deltaStr === ''}
                          onClick={() => {
                            const d = Number(deltaStr);
                            if (!Number.isFinite(d) || d === 0) return;
                            stockDelta.mutate(
                              { variantId: vid, delta: d },
                              {
                                onSuccess: () => {
                                  void refetch();
                                  setDeltaByVariant((prev) => ({ ...prev, [vid]: '' }));
                                },
                              },
                            );
                          }}
                        >
                          Apply
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            if (!confirm('Remove this variant?')) return;
                            delVariant.mutate({ id: vid, productId }, { onSuccess: () => void refetch() });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3 opacity-40" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProductDetailPage;
