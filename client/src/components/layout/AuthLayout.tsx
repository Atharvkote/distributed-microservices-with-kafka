import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-dark relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">

          <img src="/Full-Logo.png" alt="VenDeX Logo " height={100} width={200} className=" rounded-lg" />
        </Link>

        {/* Auth card */}
        <div className='flex items-center gap-2  w-full justify-between mb-12'>
          <div className='flex items-start flex-col gap-4 flex-[0.45]'>
            <h2 className="text-9xl  font-bold text-center mb-4 neon-text tracking-widest londrina-outline-regular text-primary ">VenDeX.</h2>
            <h2 className="text-9xl  font-bold text-center mb-4 neon-text figtree-variable   text-primary ">VenDeX..</h2>
            <h2 className="text-9xl  font-bold text-center mb-4 neon-text tracking-widest londrina-outline-regular text-primary ">VenDeX.....</h2>
          </div>
          <div className="glass-strong rounded-2xl p-8 neon-glow flex-[0.45]">
            <Outlet />
          </div>

        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 VenDeX. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
