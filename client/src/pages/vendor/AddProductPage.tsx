import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { vendorPaths } from '@/lib/vendor-paths';
import {
  useCatalogCategoriesQuery,
  useCreateProductMutation,
  useCreateVariantMutation,
} from '@/hooks/useVendorCatalog';
import TableSkeleton from '@/components/ui/TableSkeleton';

type Step = 1 | 2;

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: catLoading } = useCatalogCategoriesQuery();
  const createProduct = useCreateProductMutation();
  const createVariant = useCreateVariantMutation();

  const [step, setStep] = useState<Step>(1);
  const [productId, setProductId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState('');
  const [selling, setSelling] = useState('');
  const [variantFiles, setVariantFiles] = useState<File[]>([]);

  const onCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) return;
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createProduct.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category: categoryId,
        brand: brand.trim() || undefined,
        tags: tags.length ? tags : undefined,
      },
      {
        onSuccess: (res) => {
          const id = res.data.product._id;
          setProductId(id);
          setStep(2);
        },
      },
    );
  };

  const onAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
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
        files: variantFiles.length ? variantFiles : undefined,
      },
      {
        onSuccess: () => {
          setSku('');
          setMrp('');
          setSelling('');
          setVariantFiles([]);
        },
      },
    );
  };

  if (catLoading) {
    return <TableSkeleton rows={6} cols={2} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={vendorPaths.products}>
          <Button variant="outline" size="icon" className="border-border/50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add product</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Step {step} of 2 — {step === 1 ? 'listing' : 'first variant'}
          </p>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={onCreateProduct}>
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-accent/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-accent/30 border-border/50 min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select required value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-accent/30 border-border/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong max-h-72">
                      {(categories ?? []).map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand (optional)</Label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-accent/30 border-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="bg-accent/30 border-border/50"
                  placeholder="e.g. wireless, bluetooth"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={createProduct.isPending} className="gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              Continue to variant
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Variant & images</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onAddVariant} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="bg-accent/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP</Label>
                    <Input
                      required
                      type="number"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="bg-accent/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling price</Label>
                    <Input
                      required
                      type="number"
                      value={selling}
                      onChange={(e) => setSelling(e.target.value)}
                      className="bg-accent/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Images (optional)</Label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-colors">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setVariantFiles(Array.from(e.target.files ?? []))}
                    />
                  </label>
                  {variantFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground">{variantFiles.length} file(s)</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={createVariant.isPending}>
                    Add variant
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => productId && navigate(vendorPaths.product(productId))}
                  >
                    Open product
                  </Button>
                  <Button type="button" variant="ghost" asChild>
                    <Link to={vendorPaths.products}>Back to list</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Separator className="opacity-30" />
          <p className="text-sm text-muted-foreground">
            You can add more variants, stock, and pricing from the product page.
          </p>
        </>
      )}
    </div>
  );
};

export default AddProductPage;
