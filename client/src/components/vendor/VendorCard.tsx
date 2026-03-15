import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VendorCardProps {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  productCount: number;
  totalSales: number;
  status: 'active' | 'pending' | 'suspended';
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const VendorCard: React.FC<VendorCardProps> = ({
  id, name, avatar, rating, productCount, totalSales, status,
}) => {
  return (
    <Card className="glass border-border/50 hover:neon-glow transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/30 group-hover:border-primary/60 transition-all">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="gradient-primary text-white text-sm">
              {name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{name}</h3>
              <Badge variant="outline" className={cn('text-[10px] shrink-0', statusStyles[status])}>
                {status}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" /> {productCount} products
              </span>
              <span>${totalSales.toLocaleString()} sales</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-primary/20 text-primary hover:bg-primary/10 hover:neon-glow transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Store
        </Button>
      </CardContent>
    </Card>
  );
};

export default React.memo(VendorCard);
