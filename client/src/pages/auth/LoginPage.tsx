import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-2">Sign in to your NexaMarket account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 bg-accent/30 border-border/50"
              placeholder="you@example.com"
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
              className="pl-9 pr-9 bg-accent/30 border-border/50"
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
            <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">Remember me</Label>
          </div>
          <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary hover:neon-glow h-11 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="glass rounded-lg p-4 border border-border/50 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Demo accounts:</p>
        {[
          { role: 'Customer', email: 'customer@demo.com' },
          { role: 'Vendor', email: 'vendor@demo.com' },
          { role: 'Admin', email: 'admin@demo.com' },
        ].map((acc) => (
          <button
            key={acc.email}
            onClick={() => setEmail(acc.email)}
            className="block w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
          >
            <span className="font-medium text-foreground">{acc.role}:</span> {acc.email}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
