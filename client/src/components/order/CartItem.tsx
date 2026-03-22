import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { useCartStore, type CartItem as CartItemType } from '@/store/cartStore';
import { formatMoney } from '@/lib/money';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-4 p-4 glass rounded-xl border border-border/50 group hover:neon-glow transition-all duration-300">
      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-20 rounded-lg object-cover border border-border/50"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
        <p className="text-xs text-muted-foreground">{item.vendorName}</p>
        <p className="text-sm font-bold text-primary">{formatMoney(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-border/50 hover:border-primary/50"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-border/50 hover:border-primary/50"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="text-right space-y-1">
        <p className="font-bold text-sm">{formatMoney(item.price * item.quantity)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-red-400"
          onClick={() => removeItem(item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(CartItem);
