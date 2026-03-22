import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Truck, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import LightRays from '@/components/shared/LightRays';
import { useProductsQuery, useCategoriesQuery } from '@/hooks/useCatalog';
import { mapCatalogListItem } from '@/lib/catalog-mappers';
import { Skeleton } from '@/components/ui/skeleton';
import { HiShoppingCart } from "react-icons/hi2";
import CategoryGrid from '@/components/common/CategoryCards';
import { IoIosCart, IoIosHome } from "react-icons/io";

const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('sport')) return Shield;
  if (n.includes('home') || n.includes('decor')) return Package;
  if (n.includes('fashion')) return Sparkles;
  return Zap;
};

const LandingPage: React.FC = () => {
  const { data: productsData, isLoading: productsLoading } = useProductsQuery({ page: 1, limit: 4 });
  const { data: categories = [], isLoading: catLoading } = useCategoriesQuery();

  const featured = (productsData?.data ?? []).slice(0, 4).map(mapCatalogListItem);

  return (
    <div className="relative top-0 min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#f9a300"
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

      <section className="relative  z-20 flex items-center justify-center min-h-screen ">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-wide leading-none mb-1">
            Discover Premium
            <span className="neon-text font-cursive font-extrabold text-primary carattere-regular"> Products</span> from
            <br />
            Trusted <span className="neon-text font-cursive font-extrabold text-primary carattere-regular">Vendors</span>
          </h1>

          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-10 leading-relaxed">
            <span className="neon-text font-cursive font-extrabold text-primary "> VenDeX</span> brings you a curated marketplace of top-quality products from verified vendors worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/products">
              <Button
                size="lg"
                className="gradient-primary cursor-pointer rounded-md hover:neon-glow transition-all h-12 px-8 text-base font-semibold"
              >
                Browse Products
              </Button>
            </Link>
            <Link to="/vendor/dashboard">
              <Button size="lg" className="border-2 cursor-pointer bg-transparent text-amber-200 border-amber-400 hover:bg-amber-300 hover:text-black h-12 px-8 text-base">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CategoryGrid categories={categories} catLoading={catLoading} iconFor={iconFor} />

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-sm">Latest from the catalog</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
              : featured.map((product) => (
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

      <section className="py-16 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Buyer Protection', desc: 'Secure checkout with verified payment flows.' },
              { icon: Truck, title: 'Fast Shipping', desc: 'Reliable delivery partners across regions.' },
              { icon: Star, title: 'Verified Vendors', desc: 'Shop from trusted sellers on the platform.' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex items-start gap-4 glass rounded-xl p-6 border border-border/50 hover:neon-glow transition-all duration-300"
                >
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
