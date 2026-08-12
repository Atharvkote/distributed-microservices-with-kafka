import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { vendorPaths } from '@/lib/vendor-paths';
import { Package, ShoppingBag, User, Store } from 'lucide-react';

const CustomerDashboardPage: React.FC = () => {
  const { user, isVendor } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="text-muted-foreground mt-1">Your shopping home on VenDeX</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass-strong border-border/50 rounded-2xl transition-all hover:border-primary/30">
          <CardHeader>
            <ShoppingBag className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Browse products</CardTitle>
            <CardDescription>Discover items from trusted sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gradient-primary hover:neon-glow">
              <Link to="/products">Go to catalog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border/50 rounded-2xl transition-all hover:border-primary/30">
          <CardHeader>
            <Package className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Your orders</CardTitle>
            <CardDescription>Track purchases and deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="border-border/60">
              <Link to="/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border/50 rounded-2xl transition-all hover:border-primary/30">
          <CardHeader>
            <User className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="border-border/60">
              <Link to="/profile">Open profile</Link>
            </Button>
          </CardContent>
        </Card>

        {!isVendor ? (
          <Card className="glass-strong border-border/50 rounded-2xl transition-all hover:border-primary/30 border-primary/20">
            <CardHeader>
              <Store className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Sell on VenDeX</CardTitle>
              <CardDescription>Open your store and reach customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gradient-primary hover:neon-glow">
                <Link to="/become-vendor">Become a vendor</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-strong border-border/50 rounded-2xl transition-all hover:border-primary/30 border-primary/20">
            <CardHeader>
              <Store className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Vendor portal</CardTitle>
              <CardDescription>Manage products, orders, and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gradient-primary hover:neon-glow">
                <Link to={vendorPaths.home}>Open vendor dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
