import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

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

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card
      className="glass border-border/50 overflow-hidden group hover:neon-glow transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-accent/20">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay actions */}
        <div className={cn(
          'absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full glass-strong border-white/20 hover:neon-glow"
            onClick={() => addItem({ id: `ci-${id}`, productId: id, name, price, image, vendorName })}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Link to={`/products/${id}`}>
            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full glass-strong border-white/20 hover:neon-glow">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Badges */}
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 gradient-primary border-0 text-[10px] font-bold">
            -{discount}%
          </Badge>
        )}

        {/* Wishlist */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 rounded-full glass-strong border-white/10"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-white')} />
        </Button>
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Category */}
        <p className="text-[10px] font-medium text-primary uppercase tracking-wider">{category}</p>

        {/* Name */}
        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">{name}</h3>
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
                i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);
