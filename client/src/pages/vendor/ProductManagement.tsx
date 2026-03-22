import React from 'react';
import EmptyState from '@/components/common/EmptyState';

/** Catalog exposes GET /products/vendor/:id per product; bulk "my products" list is not in Kong manifest. */
const ProductManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Vendor catalog APIs</p>
      </div>
      <EmptyState
        type="products"
        title="Vendor product list"
        description="Use GET /catalog/products/vendor/:productId with JWT for individual products. Add a vendor-scoped list route to Kong + catalog to populate this table from the gateway."
      />
    </div>
  );
};

export default ProductManagement;
