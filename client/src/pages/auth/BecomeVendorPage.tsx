import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateVendorMutation } from '@/hooks/useVendorMutations';
import { vendorPaths } from '@/lib/vendor-paths';
import { Store } from 'lucide-react';

const BecomeVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const createVendor = useCreateVendorMutation();

  const idOk = storeId.trim().length >= 3;
  const nameOk = storeName.trim().length >= 2;
  const canSubmit = idOk && nameOk && !createVendor.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createVendor.mutate(
      { store_id: storeId.trim(), store_name: storeName.trim() },
      {
        onSuccess: () => {
          navigate(vendorPaths.home, { replace: true });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
          <Store className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Become a vendor</h2>
        <p className="text-sm text-muted-foreground">Create your store on VenDeX</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store_id">Store ID</Label>
          <Input
            id="store_id"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="bg-accent/30 border-border/50"
            placeholder="unique-store-id"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">Min. 3 characters, unique across the marketplace</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="store_name">Store name</Label>
          <Input
            id="store_name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="bg-accent/30 border-border/50"
            placeholder="My Awesome Shop"
            autoComplete="organization"
          />
          <p className="text-xs text-muted-foreground">Min. 2 characters</p>
        </div>
        <Button type="submit" className="w-full gradient-primary hover:neon-glow h-11 font-semibold" disabled={!canSubmit}>
          {createVendor.isPending ? 'Creating...' : 'Create vendor profile'}
        </Button>
      </form>
    </div>
  );
};

export default BecomeVendorPage;
