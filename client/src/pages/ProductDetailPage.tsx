import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Product } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, Minus, Plus, Store } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (id) {
      api.products.getById(id).then((p) => {
        setProduct(p || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="glass rounded-2xl border border-border/50 overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold neon-text">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  <Badge className="gradient-primary border-0">-{discount}%</Badge>
                </>
              )}
            </div>
          </div>

          <Separator className="opacity-30" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Vendor */}
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

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass rounded-lg border border-border/50 p-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1 gradient-primary hover:neon-glow transition-all h-11 font-semibold"
              onClick={() => {
                for (let i = 0; i < quantity; i++) {
                  addItem({ id: `ci-${product.id}-${Date.now()}`, productId: product.id, name: product.name, price: product.price, image: product.image, vendorName: product.vendorName });
                }
              }}
            >
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

          {/* Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: Shield, label: 'Warranty' },
              { icon: RotateCcw, label: '30-Day Returns' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1.5 glass rounded-lg p-3 border border-border/50 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
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
              <Badge key={tag} variant="outline" className="border-primary/20 text-primary text-xs">{tag}</Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 glass rounded-xl p-6 border border-border/50">
          <div className="space-y-4">
            {[
              { name: 'Jamie L.', rating: 5, comment: 'Absolutely love this product! Quality is outstanding.' },
              { name: 'Chris M.', rating: 4, comment: 'Great value for the price. Would recommend to others.' },
              { name: 'Taylor S.', rating: 5, comment: 'Exceeded my expectations. Fast shipping too!' },
            ].map((review, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg bg-accent/20">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarFallback className="gradient-primary text-white text-xs">{review.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 glass rounded-xl p-6 border border-border/50">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free standard shipping on orders over $100</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Express shipping available (2-3 business days)</li>
            <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> 30-day return policy for unused items</li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailPage;
