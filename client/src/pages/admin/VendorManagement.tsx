import React from 'react';
import EmptyState from '@/components/common/EmptyState';

const VendorManagement: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Vendor Management</h1>
    <EmptyState
      type="vendors"
      description="No public vendor directory endpoint is documented. Expose a secured admin route on identity-service and Kong to list vendors here."
    />
  </div>
);

export default VendorManagement;
