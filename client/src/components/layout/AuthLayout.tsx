import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-dark relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center group-hover:neon-glow transition-all duration-300">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl neon-text">NexaMarket</span>
        </Link>

        {/* Auth card */}
        <div className="glass-strong rounded-2xl p-8 neon-glow">
          <Outlet />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 NexaMarket. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
