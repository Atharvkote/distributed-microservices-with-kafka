import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
import type { CatalogVariant } from '@/api/catalog.api';
import { formatMoney } from '@/lib/money';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useProductQuery(id);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(() => (data ? mapCatalogDetail(data) : null), [data]);
  const variants: CatalogVariant[] = data?.product?.variants ?? [];

  React.useEffect(() => {
    if (variants.length && !selectedVariantId) {
      setSelectedVariantId(variants[0]._id);
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find((v) => v._id === selectedVariantId) ?? variants[0];

  const displayPrice = selectedVariant?.price?.sellingPrice ?? selectedVariant?.price?.mrp ?? product?.price ?? 0;
  const displayMrp = selectedVariant?.price?.mrp;
  const mainImage = selectedVariant?.images?.[0]?.url ?? product?.image;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
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
      vendorName: product.vendorName,
      quantity,
    });
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass rounded-2xl border border-border/50 overflow-hidden aspect-square">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
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
                    {v.sku || v.attributes?.color || v._id.slice(-6)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator className="opacity-30" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 glass rounded-xl p-4 border border-border/50">
            <Avatar className="h-10 w-10 border border-primary/30">
              <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${product.vendorName}`} />
              <AvatarFallback className="gradient-primary text-white text-xs">{product.vendorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{product.vendorName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3" /> Verified Seller
              </p>
            </div>
          </div>

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
          <EmptyState
            type="products"
            title="Reviews"
            description="Product reviews are served by the catalog reviews API. Connect review endpoints to show live feedback."
            className="glass rounded-xl border border-border/50"
          />
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
