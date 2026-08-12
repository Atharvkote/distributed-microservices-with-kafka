import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { formatMoney } from '@/lib/money';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  vendorName: string;
  vendorLogo?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  category,
  vendorName,
  vendorLogo,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem({ id: `ci-${id}`, productId: id, name, price, image, vendorName });
    toast.success(`"${name}" added to cart`, { duration: 2000 });
  }, [addItem, id, name, price, image, vendorName]);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      duration: 1500,
    });
  }, [isWishlisted]);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/products/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/products/${id}`);
        }
      }}
      className="glass border-border/50 overflow-hidden group hover:brand-glow hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-accent/20">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {discount > 0 && (
          <Badge className="absolute top-3 left-3 gradient-primary text-primary-foreground border-0 text-[10px] font-bold">
            -{discount}%
          </Badge>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/15 backdrop-blur border-white/10 hover:bg-white/30"
          onClick={handleWishlist}
        >
          <Heart
            className={cn('h-4 w-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-white')}
          />
        </Button>
      </div>

      <CardContent className="p-4 space-y-2">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{category}</p>

        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-2">
          {vendorLogo ? (
            <img
              src={vendorLogo}
              alt=""
              className="h-5 w-5 rounded-full object-cover border border-border/40"
            />
          ) : null}
          <p className="text-xs text-muted-foreground line-clamp-1">{vendorName}</p>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.floor(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatMoney(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatMoney(originalPrice)}
              </span>
            )}
          </div>
          <Button type="button" size="sm" className="gradient-primary" onClick={handleAddToCart}>
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);
