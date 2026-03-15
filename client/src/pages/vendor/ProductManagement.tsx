import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, type Product } from '@/services/api';
import ProductTable from '@/components/product/ProductTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    api.products.getAll().then(setProducts);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} products</p>
        </div>
        <Link to="/vendor/products/new">
          <Button className="gradient-primary hover:neon-glow">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-accent/30 border-border/50"
        />
      </div>

      <ProductTable products={filtered} />
    </div>
  );
};

export default ProductManagement;
