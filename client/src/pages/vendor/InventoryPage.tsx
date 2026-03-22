import React from 'react';
import EmptyState from '@/components/common/EmptyState';

const InventoryPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Inventory</h1>
    <EmptyState
      type="products"
      description="Inventory is managed via catalog-service variant/inventory endpoints. Wire them through Kong (/catalog) to enable this view."
    />
  </div>
);

export default InventoryPage;
