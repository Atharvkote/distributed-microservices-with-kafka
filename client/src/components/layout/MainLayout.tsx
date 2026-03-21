import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package, ShoppingCart, Search, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import Footer from './Footer';
import MobileMenu from './MobileMenu';


const MainLayout: React.FC = () => {
  const cartCount = useCartStore((s) => s.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center group-hover:brand-glow transition-all duration-300">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg  hidden sm:block tracking-widest">VenDeX</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Products</Link>
            <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">My Orders</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] gradient-primary border-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border border-primary/30">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="gradient-primary text-xs text-white">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-strong">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Vendor Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer"><User className="h-4 w-4 mr-2" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer"><Settings className="h-4 w-4 mr-2" /> Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="brand">
                  Sign In
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu variant="customer" />

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
