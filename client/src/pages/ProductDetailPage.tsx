import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, Minus, Plus, Store } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductQuery } from '@/hooks/useCatalog';
import { mapCatalogDetail } from '@/lib/catalog-mappers';
import type { CatalogVariant, VendorStoreRef } from '@/api/catalog.api';
import { formatMoney } from '@/lib/money';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import {
  useAddReviewMutation,
  useDeleteReviewMutation,
  useProductReviewsQuery,
  useUpdateReviewMutation,
} from '@/hooks/useReviews';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProductQuery(id);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const reviewsQ = useProductReviewsQuery(id, { page: 1, limit: 20 });
  const addReview = useAddReviewMutation(id ?? '');
  const updateReview = useUpdateReviewMutation(id ?? '');
  const deleteReview = useDeleteReviewMutation(id ?? '');

  const product = useMemo(() => (data ? mapCatalogDetail(data) : null), [data]);
  const variants: CatalogVariant[] = data?.product?.variants ?? [];

  const vendorPopulated = data?.product?.vendor;
  const vendorStore: VendorStoreRef | null =
    vendorPopulated && typeof vendorPopulated === 'object' ? (vendorPopulated as VendorStoreRef) : null;

  React.useEffect(() => {
    if (variants.length && !selectedVariantId) {
      setSelectedVariantId(variants[0]._id);
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find((v) => v._id === selectedVariantId) ?? variants[0];

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVariantId]);

  const displayPrice =
    selectedVariant?.price?.sellingPrice ?? selectedVariant?.price?.mrp ?? product?.price ?? 0;
  const displayMrp = selectedVariant?.price?.mrp;
  const variantImages = selectedVariant?.images ?? [];
  const mainFromVariant = variantImages[0]?.url ?? product?.image;
  const galleryUrls =
    variantImages.length > 0
      ? variantImages.map((i) => i.url).filter(Boolean)
      : mainFromVariant
        ? [mainFromVariant]
        : [];

  const mainImage = galleryUrls[activeImageIndex] ?? mainFromVariant ?? product?.image;

  const variantLabel = (v: CatalogVariant) => {
    const attrs = v.attributes ?? {};
    const kv = Object.entries(attrs)
      .slice(0, 2)
      .map(([k, val]) => `${k}: ${val}`)
      .join(' · ');
    return kv || v.sku || v._id.slice(-6);
  };

  const attributeEntries = Object.entries(selectedVariant?.attributes ?? {});

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="text-muted-foreground mt-2">The product may be unavailable in the catalog.</p>
      </div>
    );
  }

  const discount =
    displayMrp && displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : 0;

  const displayVendorName = vendorStore?.store_name?.trim() || product.vendorName;
  const displayVendorLogo = vendorStore?.store_logo?.trim();
  const displayVendorRating =
    typeof vendorStore?.ratings === 'number' ? vendorStore.ratings : product.vendorRating;
  const vendorId =
    (vendorStore?._id && String(vendorStore._id)) || (product.vendorId && product.vendorId !== 'vendor' ? product.vendorId : '');

  const reviews = reviewsQ.data?.reviews ?? [];
  const myReview =
    user?.id ? reviews.find((r) => (typeof r.user === 'string' ? r.user : r.user?._id) === user.id) : undefined;

  const submitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add a review');
      navigate('/login');
      return;
    }
    try {
      await addReview.mutateAsync({ rating: draftRating, comment: draftComment.trim() });
      setDraftComment('');
      setDraftRating(5);
      toast.success('Review added');
    } catch {
      toast.error('Unable to add review');
    }
  };

  const submitUpdate = async () => {
    if (!editingId) return;
    try {
      await updateReview.mutateAsync({ id: editingId, rating: editRating, comment: editComment.trim() });
      setEditingId(null);
      toast.success('Review updated');
    } catch {
      toast.error('Unable to update review');
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariantId && variants.length > 0) {
      toast.error('Please select a variant');
      return;
    }
    const lineId = `${product.id}:${selectedVariantId ?? 'novar'}`;
    addItem({
      id: lineId,
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      price: displayPrice,
      image: mainImage ?? product.image,
      vendorName: displayVendorName,
      quantity,
    });
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="glass rounded-2xl border border-border/50 overflow-hidden aspect-square">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {galleryUrls.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {galleryUrls.map((url, idx) => (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    'h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0',
                    activeImageIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-border/40 opacity-80 hover:opacity-100'
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold neon-text">{formatMoney(displayPrice)}</span>
              {displayMrp != null && displayMrp > displayPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatMoney(displayMrp)}</span>
                  <Badge className="gradient-primary border-0">-{discount}%</Badge>
                </>
              )}
            </div>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Variant</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Button
                    key={v._id}
                    type="button"
                    size="sm"
                    variant={selectedVariantId === v._id ? 'default' : 'outline'}
                    onClick={() => setSelectedVariantId(v._id)}
                    className="text-xs"
                  >
                    {variantLabel(v)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {attributeEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Details</p>
              <div className="flex flex-wrap gap-2">
                {attributeEntries.map(([key, val]) => (
                  <Badge key={key} variant="secondary" className="font-normal text-xs">
                    <span className="text-muted-foreground mr-1">{key}:</span>
                    {val}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="opacity-30" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <button
            type="button"
            onClick={() => vendorId && navigate(`/vendors/${vendorId}`)}
            className="w-full text-left flex items-center gap-3 glass rounded-xl p-4 border border-border/50 hover:border-primary/40 transition-colors"
          >
            <Avatar className="h-10 w-10 border border-primary/30">
              <AvatarImage src={displayVendorLogo || undefined} alt={displayVendorName} />
              <AvatarFallback className="gradient-primary text-white text-xs">
                {displayVendorName[0]?.toUpperCase() ?? 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayVendorName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Store className="h-3 w-3" /> Store
                </span>
                {displayVendorRating != null && displayVendorRating > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {displayVendorRating.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 glass rounded-lg border border-border/50 p-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button className="flex-1 min-w-[200px] gradient-primary hover:neon-glow transition-all h-11 font-semibold" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn('h-11 w-11 border-border/50', isWishlisted && 'border-red-500/50')}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart className={cn('h-5 w-5', isWishlisted ? 'fill-red-500 text-red-500' : '')} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Shipping' },
              { icon: Shield, label: 'Warranty' },
              { icon: RotateCcw, label: 'Returns' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 glass rounded-lg p-3 border border-border/50 text-center"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6 glass rounded-xl p-6 border border-border/50">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-primary/20 text-primary text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="glass rounded-xl border border-border/50 p-5 space-y-5">
            {!myReview && (
              <div className="space-y-3 border border-border/40 rounded-lg p-4">
                <p className="font-medium">Write a review</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="sm"
                      variant={idx + 1 <= draftRating ? 'default' : 'outline'}
                      onClick={() => setDraftRating(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={draftComment}
                  onChange={(e) => setDraftComment(e.target.value)}
                  placeholder="Share your experience with this product"
                />
                <Button onClick={submitReview} disabled={addReview.isPending}>
                  Submit review
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {reviews.map((r) => {
                const uid = typeof r.user === 'string' ? r.user : r.user?._id;
                const canEdit = user?.id && uid === user.id;
                const isEditing = editingId === r._id;
                const author =
                  typeof r.user === 'string' ? 'User' : r.user?.full_name || r.user?.email || 'User';
                return (
                  <div key={r._id} className="rounded-lg border border-border/40 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{author}</p>
                      <div className="text-sm inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Button
                              key={idx}
                              type="button"
                              size="sm"
                              variant={idx + 1 <= editRating ? 'default' : 'outline'}
                              onClick={() => setEditRating(idx + 1)}
                            >
                              {idx + 1}
                            </Button>
                          ))}
                        </div>
                        <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={submitUpdate} disabled={updateReview.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{r.comment || 'No comment provided.'}</p>
                    )}
                    {canEdit && !isEditing && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(r._id);
                            setEditRating(r.rating);
                            setEditComment(r.comment || '');
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await deleteReview.mutateAsync(r._id);
                              toast.success('Review deleted');
                            } catch {
                              toast.error('Unable to delete review');
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 glass rounded-xl p-6 border border-border/50">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Standard and express options at checkout.
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" /> Return policy depends on the vendor.
            </li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailPage;
