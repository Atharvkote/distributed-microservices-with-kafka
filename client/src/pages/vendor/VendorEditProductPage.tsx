import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import { vendorPaths } from '@/lib/vendor-paths';
import {
  useVendorProductQuery,
  useCatalogCategoriesQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/hooks/useVendorCatalog';
import { toast } from 'sonner';
import type { CatalogVariant } from '@/api/catalog.api';
import { formatMoney } from '@/lib/money';

const VARIANT_PLACEHOLDER = 'https://placehold.co/160x160/e2e8f0/64748b?text=Variant';

function categoryIdFromProduct(cat: unknown): string {
  if (cat && typeof cat === 'object' && '_id' in cat) return String((cat as { _id: string })._id);
  return typeof cat === 'string' ? cat : '';
}

const VendorEditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useVendorProductQuery(productId);
  const { data: categories, isLoading: catLoading } = useCatalogCategoriesQuery();
  const updateProduct = useUpdateProductMutation();
  const deleteProduct = useDeleteProductMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const product = data?.product;
  const variants: CatalogVariant[] = product?.variants ?? [];

  useEffect(() => {
    if (!product) return;
    setTitle(product.title ?? '');
    setDescription(product.description ?? '');
    setCategoryId(categoryIdFromProduct(product.category));
    setBrand(product.brand ?? '');
    setTagsStr((product.tags ?? []).join(', '));
    setIsActive(product.isActive !== false);
  }, [product]);

  if (isError || !productId) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (isLoading || !product || catLoading) {
    return <TableSkeleton rows={8} cols={2} />;
  }

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      toast.error('Title, description, and category are required');
      return;
    }
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateProduct.mutate(
      {
        id: productId,
        body: {
          title: title.trim(),
          description: description.trim(),
          category: categoryId,
          brand: brand.trim() || undefined,
          tags: tags.length ? tags : undefined,
          isActive,
        },
      },
      { onSuccess: () => toast.success('Product saved') },
    );
  };

  const onConfirmDelete = () => {
    deleteProduct.mutate(productId, {
      onSuccess: () => {
        setDeleteOpen(false);
        navigate(vendorPaths.products);
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={vendorPaths.product(productId)}>
          <Button variant="outline" size="icon" className="border-border/50" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">Edit product</h1>
          <p className="text-muted-foreground text-sm mt-1">Update listing details</p>
        </div>
        <Button type="button" variant="destructive" className="shrink-0" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <form onSubmit={onSave}>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-accent/30 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="bg-accent/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-accent/30 border-border/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-accent/30 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className="bg-accent/30 border-border/50" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="active-edit" />
              <Label htmlFor="active-edit" className="text-sm text-muted-foreground cursor-pointer">
                Active in catalog
              </Label>
            </div>
            <Button type="submit" className="gradient-primary" disabled={updateProduct.isPending}>
              Save changes
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Variants (read-only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants. Add them from the product detail page.</p>
          ) : (
            variants.map((v, idx) => {
              const inv = v.inventory;
              const stock = inv?.stock ?? 0;
              const attrs = v.attributes ?? {};
              return (
                <div key={v._id}>
                  <div className="rounded-xl border border-border/40 bg-accent/5 p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm">{v.sku}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(v.price?.sellingPrice ?? 0)}
                          {v.price?.mrp != null ? ` · MRP ${formatMoney(v.price.mrp)}` : ''}
                          {v.isActive === false ? ' · inactive' : ''}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Stock {stock}
                        {inv?.reserved != null ? ` · reserved ${inv.reserved}` : ''}
                      </p>
                    </div>
                    {Object.keys(attrs).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(attrs).map(([k, val]) => (
                          <Badge key={k} variant="secondary" className="text-xs font-normal">
                            {k}: {val}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(v.images ?? []).length > 0 ? (
                        (v.images ?? []).map((im, i) => (
                          <img
                            key={`${im.url}-${i}`}
                            src={im.url}
                            alt={im.alt ?? v.sku}
                            className="h-16 w-16 rounded-md object-cover border border-border/40"
                          />
                        ))
                      ) : (
                        <img
                          src={VARIANT_PLACEHOLDER}
                          alt="No variant image"
                          className="h-16 w-16 rounded-md object-cover border border-border/40"
                        />
                      )}
                    </div>
                  </div>
                  {idx < variants.length - 1 ? <Separator className="opacity-40 my-4" /> : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deactivates the product and all variants. You can re-activate from the catalog tools if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete();
              }}
              disabled={deleteProduct.isPending}
            >
              Archive product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorEditProductPage;
