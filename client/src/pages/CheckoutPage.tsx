import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import CheckoutSummary from '@/components/order/CheckoutSummary';
import { CreditCard, MapPin, CheckCircle2, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCreateOrderMutation, useUpdateOrderPaymentMutation } from '@/hooks/useOrders';
import { paymentsApi } from '@/api/payments.api';
import { loadRazorpayScript } from '@/lib/razorpay';
import { toast } from 'sonner';
import { formatMoney } from '@/lib/money';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { items, totalPrice, clearCart } = useCartStore();
  const createOrder = useCreateOrderMutation();
  const updatePayment = useUpdateOrderPaymentMutation();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [createdMongoId, setCreatedMongoId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const canShip = street && city && state && postalCode && country && user;

  const handleCreateOrder = async () => {
    if (!user || !canShip) {
      toast.error('Complete shipping details');
      return;
    }
    if (!items.length) {
      toast.error('Cart is empty');
      return;
    }
    try {
      const res = await createOrder.mutateAsync({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: phone || undefined,
        shippingAddress: { street, city, state, postalCode, country },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
        notes: notes || undefined,
      });
      const payload = res.data;
      setCreatedMongoId(payload.order._id);
      setOrderNumber(
        payload.order.orderNumber ?? `ORD-${payload.order._id.slice(0, 12).toUpperCase()}`
      );
      setStep('payment');
    } catch {
      /* toast from hook */
    }
  };

  const payWithRazorpay = async () => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error('Set VITE_RAZORPAY_KEY_ID for Razorpay Checkout');
      return;
    }
    if (!orderNumber || !createdMongoId) return;

    const ok = await loadRazorpayScript();
    if (!ok || !window.Razorpay) {
      toast.error('Could not load Razorpay');
      return;
    }

    const amount = totalPrice();
    try {
      const { data: pay } = await paymentsApi.create({
        orderId: orderNumber,
        amount,
        currency: import.meta.env.VITE_DEFAULT_CURRENCY || 'INR',
      });

      const rzp = new window.Razorpay({
        key,
        order_id: pay.data.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentsApi.verify({
              orderId: orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await updatePayment.mutateAsync({
              id: createdMongoId,
              paymentStatus: 'PAID',
              transactionId: response.razorpay_payment_id,
              paymentMethod: 'razorpay',
            });
            clearCart();
            toast.success('Payment successful');
            navigate('/orders');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: phone,
        },
        theme: { color: '#6366f1' },
      });
      rzp.open();
    } catch {
      toast.error('Could not start payment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex items-center gap-4 mb-8">
        {[
          { key: 'shipping', label: 'Shipping', icon: MapPin },
          { key: 'payment', label: 'Payment', icon: CreditCard },
          { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon;
          const active = s.key === step;
          const past =
            ['shipping', 'payment', 'confirm'].indexOf(s.key) <
            ['shipping', 'payment', 'confirm'].indexOf(step);
          return (
            <React.Fragment key={s.key}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  active ? 'text-primary' : past ? 'text-emerald-400' : 'text-muted-foreground'
                }`}
                onClick={() => past && setStep(s.key as typeof step)}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    active
                      ? 'gradient-primary text-white neon-glow'
                      : past
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'glass border border-border/50'
                  }`}
                >
                  {past ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s.label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border/50" />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 'shipping' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="bg-accent/30 border-border/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="bg-accent/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="bg-accent/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal code</Label>
                    <Input
                      id="postal"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-accent/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="bg-accent/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-accent/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-accent/30" />
                </div>
                <Button
                  className="w-full gradient-primary h-11"
                  disabled={!canShip || createOrder.isPending}
                  onClick={() => void handleCreateOrder()}
                >
                  {createOrder.isPending ? 'Creating order…' : 'Continue to payment'}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Razorpay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Order {orderNumber} — total {formatMoney(totalPrice())}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Secured via payment service / Razorpay.
                </div>
                <Button className="w-full gradient-primary h-11" onClick={() => void payWithRazorpay()}>
                  Pay now
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setStep('confirm')}>
                  Skip to confirmation (order unpaid)
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'confirm' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {orderNumber
                    ? `Order ${orderNumber} created. Complete payment from the payment step when ready.`
                    : 'Complete shipping to create your order.'}
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                  View orders
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <CheckoutSummary showCheckoutButton={false} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
