import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  id, name, price, originalPrice, image, rating, reviewCount, category, vendorName,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = useCallback(() => {
    addItem({ id: `ci-${id}`, productId: id, name, price, image, vendorName });
    toast.success(`"${name}" added to cart`, { duration: 2000 });
  }, [addItem, id, name, price, image, vendorName]);

  const handleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      duration: 1500,
    });
  }, [isWishlisted]);

  return (
    <Card
      className="glass border-border/50 overflow-hidden group hover:brand-glow hover:border-primary/30 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-accent/20">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay actions */}
        <div
          className={cn(
            'absolute inset-0 bg-black/35 flex items-center justify-center gap-3 transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/35"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Link to={`/products/${id}`}>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/35"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 gradient-primary text-primary-foreground border-0 text-[10px] font-bold">
            -{discount}%
          </Badge>
        )}

        {/* Wishlist */}
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
        {/* Category */}
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{category}</p>

        {/* Name */}
        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Vendor */}
        <p className="text-xs text-muted-foreground">{vendorName}</p>

        {/* Rating */}
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

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold">{formatMoney(price)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(originalPrice)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);
