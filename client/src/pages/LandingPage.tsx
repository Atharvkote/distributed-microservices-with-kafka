import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Truck, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import { api, type Product } from '@/services/api';
import LightRays from '@/components/shared/LightRays';

const categories = [
  { name: 'Electronics', icon: Zap, count: 248 },
  { name: 'Fashion', icon: Sparkles, count: 186 },
  { name: 'Home & Decor', icon: Package, count: 124 },
  { name: 'Sports', icon: Shield, count: 92 },
];

const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.products.getAll().then((p) => setFeaturedProducts(p.slice(0, 4)));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Light Rays Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#bd71ff"
          raysSpeed={2}
          lightSpread={1}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.5}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={2}
          saturation={1}
          className="w-full h-full"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-20 flex items-center justify-center min-h-screen py-20">

        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Discover Premium
            <span className="neon-text font-cursive font-extrabold text-primary">
              {" "}Products
            </span>{" "}
            from
            <br />
            Trusted{" "}
            <span className="neon-text font-cursive font-extrabold text-primary">
              Vendors
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            VenDeX brings you a curated marketplace of top-quality products from
            verified vendors worldwide. Shop with confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products">
              <Button
                size="lg"
                className="gradient-primary rounded-md hover:neon-glow transition-all h-12 px-8 text-base font-semibold"
              >
                Browse Products
              </Button>
            </Link>

            <Link to="/vendor/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary hover:bg-primary text-primary h-12 px-8 text-base"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} to={`/products?category=${cat.name}`}>
                  <div className="glass border border-border/50 rounded-xl p-6 text-center group hover:neon-glow transition-all duration-300 cursor-pointer">
                    <div className="h-14 w-14 rounded-xl gradient-primary mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count} products</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-sm">Hand-picked by our editors</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                category={product.category}
                vendorName={product.vendorName}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Buyer Protection', desc: 'Full refund if item is not as described or not delivered.' },
              { icon: Truck, title: 'Free Shipping', desc: 'Free delivery on orders over $100. Fast & reliable.' },
              { icon: Star, title: 'Verified Vendors', desc: 'All vendors are verified and rated by real customers.' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.title} className="flex items-start gap-4 glass rounded-xl p-6 border border-border/50 hover:neon-glow transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{badge.title}</h3>
                    <p className="text-sm text-muted-foreground">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
