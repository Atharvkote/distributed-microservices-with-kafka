import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { usersApi, type CompleteProfileBody } from '@/api/users.api';
import { queryKeys } from '@/hooks/queryKeys';
import { useUserProfileQuery } from '@/hooks/useUserProfile';
import { getPostAuthRedirectPath } from '@/lib/profile-utils';
import type { UserProfileSummary } from '@/lib/profile-utils';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Your details', 'Address', 'Review'] as const;
const PIN_RE = /^[0-9]{6}$/;

function stepValid(s: number, form: CompleteProfileBody): boolean {
  if (s === 0) return Boolean(form.full_name.trim() && form.phone.trim().length >= 10);
  if (s === 1) {
    const a = form.address;
    return Boolean(
      a.residential_address.trim() &&
        a.country.trim() &&
        a.state.trim() &&
        a.city.trim() &&
        PIN_RE.test(a.pincode.trim())
    );
  }
  return true;
}

const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((x) => x.user?.id);
  const applyRefreshedToken = useAuthStore((x) => x.applyRefreshedToken);
  const patchUserFromProfileDoc = useAuthStore((x) => x.patchUserFromProfileDoc);
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useUserProfileQuery();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CompleteProfileBody>({
    full_name: '',
    phone: '',
    address: {
      residential_address: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      full_name: profile.full_name || prev.full_name,
      phone: profile.phone || prev.phone,
      address: {
        residential_address: profile.address?.residential_address ?? prev.address.residential_address,
        country: profile.address?.country ?? prev.address.country,
        state: profile.address?.state ?? prev.address.state,
        city: profile.address?.city ?? prev.address.city,
        pincode: profile.address?.pincode ?? prev.address.pincode,
      },
    }));
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (body: CompleteProfileBody) => {
      if (!userId) throw new Error('Missing user');
      return usersApi.completeProfile(userId, body).then((r) => r.data);
    },
    onSuccess: (data) => {
      const token = data.accessToken ?? data.token;
      if (token) applyRefreshedToken(token);
      patchUserFromProfileDoc(data.user as UserProfileSummary);
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success(data.message || 'Profile complete');
      const role = useAuthStore.getState().user?.role ?? 'customer';
      navigate(getPostAuthRedirectPath({ profileCompleted: true, role }), { replace: true });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
          : '';
      toast.error(msg || 'Could not save profile');
    },
  });

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const canNext = stepValid(step, form);
  const canSubmit = stepValid(0, form) && stepValid(1, form);

  if (!userId) return null;

  if (profileLoading && !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete your profile</h2>
        <p className="text-sm text-muted-foreground">A few details so we can serve you better</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground px-1 gap-2 flex-wrap">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(
                'transition-colors',
                i === step && 'text-primary font-semibold',
                i < step && 'text-primary/80'
              )}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="min-h-[280px] space-y-4 transition-all duration-300">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cp-name">Full name</Label>
              <Input
                id="cp-name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="bg-accent/30 border-border/50"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-phone">Phone</Label>
              <Input
                id="cp-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="bg-accent/30 border-border/50"
                placeholder="10+ digits"
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">At least 10 characters</p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Street / address</Label>
              <Input
                value={form.address.residential_address}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    address: { ...f.address, residential_address: e.target.value },
                  }))
                }
                className="bg-accent/30 border-border/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={form.address.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: { ...f.address, country: e.target.value } }))
                  }
                  className="bg-accent/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={form.address.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: { ...f.address, state: e.target.value } }))
                  }
                  className="bg-accent/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.address.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))
                  }
                  className="bg-accent/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode (6 digits)</Label>
                <Input
                  value={form.address.pincode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      address: { ...f.address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) },
                    }))
                  }
                  className="bg-accent/30 border-border/50"
                  inputMode="numeric"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-border/50 bg-accent/20 p-4 space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {form.full_name}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {form.phone}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span> {form.address.residential_address},{' '}
              {form.address.city}, {form.address.state} {form.address.pincode}, {form.address.country}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        {step > 0 ? (
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            className="flex-1 gradient-primary hover:neon-glow"
            disabled={!canNext}
            onClick={() => canNext && setStep((s) => s + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 gradient-primary hover:neon-glow"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            {mutation.isPending ? (
              'Saving...'
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" /> Finish
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompleteProfilePage;
