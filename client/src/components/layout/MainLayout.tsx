import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package, ShoppingCart, Search, Menu, Heart, HeartPlus } from 'lucide-react';
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
import { FiPackage } from "react-icons/fi";
import { IoIosCart, IoIosHome, IoMdSearch } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import {useLocation} from "react-router-dom"

const MainLayout: React.FC = () => {
  const cartCount = useCartStore((s) => s.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="relative min-h-screen flex flex-col ">
      {/* Navbar */}
      <header className={` ${!isHome ? "" : "fixed inset-0 z-50 top-0" } w-full h-16 bg-transparent backdrop:backdrop-blur-2xl`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group">
            <img src="/Logo.png" alt="NexaMarket" height={45} width={45} className=" rounded-lg" />
            <span className="font-bold text-2xl tracking-wider neon-text">VenDe<span className="text-3xl">X </span></span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
              <MdHome className="h-5 w-5" />
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
              <AiFillProduct className="h-5 w-5" />
              Products
            </Link>
            <Link to="/orders" className="text-sm font-medium text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
              <IoIosCart className="h-5 w-5" />
              My Orders
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white cursor-pointer hover:text-foreground">
              <IoMdSearch className="h-7 w-7" />
            </Button>

            <Button variant="ghost" size="icon" className="ttext-white cursor-pointer hover:text-foreground hidden sm:flex">
              <HeartPlus className="h-5 w-5" />
            </Button>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-white cursor-pointer hover:text-foreground">
                <IoIosCart  className="h-7 w-7" />
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
