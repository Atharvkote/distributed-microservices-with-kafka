import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { useCartStore, type CartItem as CartItemType } from '@/store/cartStore';

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
        <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity controls */}
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

      {/* Subtotal + remove */}
      <div className="text-right space-y-1">
        <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.id)}
        >
          <X className="h-3 w-3 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
};

export default React.memo(CartItem);
