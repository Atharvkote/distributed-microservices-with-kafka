import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/lib/money';

interface CheckoutSummaryProps {
  showCheckoutButton?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ showCheckoutButton = true }) => {
  const { items } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Card className="glass border-border/50 sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span className="font-medium">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className={shipping === 0 ? 'text-emerald-400 font-medium' : 'font-medium'}>
              {shipping === 0 ? 'FREE' : formatMoney(shipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (est.)</span>
            <span className="font-medium">{formatMoney(tax)}</span>
          </div>
        </div>

        <Separator className="opacity-30" />

        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="neon-text">{formatMoney(total)}</span>
        </div>

        {showCheckoutButton && (
          <Link to="/checkout" className="block">
            <Button className="w-full gradient-primary hover:neon-glow transition-all h-11 font-semibold">
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>Free shipping on orders over {formatMoney(100)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(CheckoutSummary);
