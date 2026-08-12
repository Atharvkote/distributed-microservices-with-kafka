import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import { getPostAuthRedirectPath } from '@/lib/profile-utils';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, authReady, user, profileCompleted } = useAuthStore();

  if (authReady && isAuthenticated && user) {
    return (
      <Navigate
        to={getPostAuthRedirectPath({ profileCompleted, role: user.role })}
        replace
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const s = useAuthStore.getState();
      if (s.user) {
        navigate(
          getPostAuthRedirectPath({ profileCompleted: s.profileCompleted, role: s.user.role }),
          { replace: true }
        );
      }
    } catch {
      /* toast in store */
    }
  };

  return (
    <div className="space-y-6">

      <div className="text-center">
        <h2 className="text-2xl font-bold">WELCOME <span className='carattere-regular text-primary text-5xl'>back</span></h2>
        <p className="text-sm text-muted-foreground mt-2">Sign in to your VenDeX account</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4  max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 py-6 bg-accent/30 border-primary/80"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-4 py-6 bg-accent/30 border-primary/80 "
              placeholder="********"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" className="border-border/50" />
            <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
              Remember me
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full gradient-primary hover:neon-glow h-11 font-semibold" disabled={isLoading}>
          {isLoading ? 'Signing in...' : (
            <>
              <LogIn className="h-4 w-4 mr-2" /> Sign In
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Using API gateways with stantdard ratelimits use attemps wisely.
      </p>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
