import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import CheckoutSummary from '@/components/order/CheckoutSummary';
import { CreditCard, MapPin, CheckCircle2, Lock } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { key: 'shipping', label: 'Shipping', icon: MapPin },
          { key: 'payment', label: 'Payment', icon: CreditCard },
          { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon;
          const isActive = s.key === step;
          const isPast = ['shipping', 'payment', 'confirm'].indexOf(s.key) < ['shipping', 'payment', 'confirm'].indexOf(step);
          return (
            <React.Fragment key={s.key}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  isActive ? 'text-primary' : isPast ? 'text-emerald-400' : 'text-muted-foreground'
                }`}
                onClick={() => {
                  if (isPast) setStep(s.key as any);
                }}
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive ? 'gradient-primary text-white neon-glow' : isPast ? 'bg-emerald-500/20 text-emerald-400' : 'glass border border-border/50'
                }`}>
                  {isPast ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s.label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border/50" />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping */}
          {step === 'shipping' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Alex" className="bg-accent/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Rivera" className="bg-accent/30 border-border/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main Street" className="bg-accent/30 border-border/50" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" className="bg-accent/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select>
                      <SelectTrigger className="bg-accent/30 border-border/50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="glass-strong">
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="10001" className="bg-accent/30 border-border/50" />
                  </div>
                </div>
                <Button className="gradient-primary hover:neon-glow w-full h-11 mt-4" onClick={() => setStep('payment')}>
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {step === 'payment' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input id="cardName" placeholder="Alex Rivera" className="bg-accent/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="bg-accent/30 border-border/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" className="bg-accent/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" className="bg-accent/30 border-border/50" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Your payment information is encrypted and secure.
                </div>
                <Button className="gradient-primary hover:neon-glow w-full h-11 mt-4" onClick={() => setStep('confirm')}>
                  Review Order
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          {step === 'confirm' && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Order Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="glass rounded-xl p-4 border border-border/50 space-y-2">
                  <h4 className="text-sm font-semibold">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">Alex Rivera, 123 Main Street, New York, NY 10001</p>
                </div>
                <div className="glass rounded-xl p-4 border border-border/50 space-y-2">
                  <h4 className="text-sm font-semibold">Payment Method</h4>
                  <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
                </div>
                <Button className="gradient-primary hover:neon-glow w-full h-11 font-semibold">
                  Place Order
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
