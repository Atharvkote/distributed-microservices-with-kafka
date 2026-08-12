import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Github, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 glass mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg neon-text">VenDeX</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier multi-vendor marketplace for premium products and trusted sellers.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Marketplace</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">All Products</Link>
              <Link to="/products?category=Electronics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Electronics</Link>
              <Link to="/products?category=Fashion" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fashion</Link>
              <Link to="/products?category=Home" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home & Decor</Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shipping Policy</Link>
              <Link to="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">Returns</Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8 opacity-30" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 VenDeX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
