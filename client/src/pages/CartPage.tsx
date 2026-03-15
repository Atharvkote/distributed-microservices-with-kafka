import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/order/CartItem';
import CheckoutSummary from '@/components/order/CheckoutSummary';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
        <div className="h-20 w-20 rounded-2xl glass border border-border/50 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Browse our products and add items to your cart.</p>
        <Link to="/products">
          <Button className="gradient-primary hover:neon-glow">
            <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>

        <div>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
