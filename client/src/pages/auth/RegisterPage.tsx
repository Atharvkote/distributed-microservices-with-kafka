import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { getPostAuthRedirectPath } from '@/lib/profile-utils';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrengthMessage(password: string): string | null {
  if (password.length < 8) return 'At least 8 characters';
  if (!/[A-Za-z]/.test(password)) return 'Include a letter';
  if (!/[0-9]/.test(password)) return 'Include a number';
  return null;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, authReady, user, profileCompleted } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const n = name.trim();
    if (!n) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email';
    const pwMsg = passwordStrengthMessage(password);
    if (pwMsg) e.password = pwMsg;
    if (!confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match';
    return e;
  }, [name, email, password, confirmPassword]);

  const showErrors = {
    name: touched.name && Boolean(errors.name),
    email: touched.email && Boolean(errors.email),
    password: touched.password && Boolean(errors.password),
    confirmPassword: touched.confirmPassword && Boolean(errors.confirmPassword),
  };

  const isValid = Object.keys(errors).length === 0;

  if (authReady && isAuthenticated && user) {
    return (
      <Navigate
        to={getPostAuthRedirectPath({ profileCompleted, role: user.role })}
        replace
      />
    );
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!isValid) return;
    try {
      await register({
        full_name: name.trim(),
        email: email.trim(),
        password,
      });
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
        <h2 className="text-2xl font-bold">Create An    <span className='carattere-regular text-primary text-4xl ml-3'> Account</span></h2>
        <p className="text-sm text-muted-foreground mt-2">Join VenDeX in seconds</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              className={cn(
                'pl-9 py-6 bg-accent/30 border-primary/80 transition-colors',
                showErrors.name && 'border-destructive/80 focus-visible:ring-destructive/30'
              )}
              placeholder="Jane Doe"
              autoComplete="name"
              aria-invalid={showErrors.name}
            />
          </div>
          {showErrors.name ? (
            <p className="text-xs text-destructive">{errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={cn(
                'pl-9 py-6 bg-accent/30 border-primary/80 transition-colors',
                showErrors.email && 'border-destructive/80 focus-visible:ring-destructive/30'
              )}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={showErrors.email}
            />
          </div>
          {showErrors.email ? (
            <p className="text-xs text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={cn(
                'pl-9 pr-9 py-6 bg-accent/30 border-primary/80 transition-colors',
                showErrors.password && 'border-destructive/80 focus-visible:ring-destructive/30'
              )}
              autoComplete="new-password"
              aria-invalid={showErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showErrors.password ? (
            <p className="text-xs text-destructive">{errors.password}</p>
          ) : (
            <p className="text-xs text-muted-foreground">8+ characters with a letter and a number</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              className={cn(
                'pl-9 pr-9 py-6 bg-accent/30 border-primary/80 transition-colors',
                showErrors.confirmPassword && 'border-destructive/80 focus-visible:ring-destructive/30'
              )}
              placeholder="********"
              autoComplete="new-password"
              aria-invalid={showErrors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showErrors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary hover:neon-glow h-11 font-semibold transition-all duration-300"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            'Creating account...'
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create account
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
