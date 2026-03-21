import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Product } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Warehouse, Search, AlertTriangle, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

const getStockLevel = (stock: number) => {
  if (stock <= 10)
    return { label: 'Critical', className: 'status-rejected' };
  if (stock <= 30)
    return { label: 'Low', className: 'status-pending' };
  return { label: 'In Stock', className: 'status-active' };
};

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch {
      setError(true);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [products, debouncedSearch]
  );

  const lowStockCount = useMemo(
    () => filtered.filter((p) => p.stock <= 10).length,
    [filtered]
  );

  if (error) {
    return <ErrorState onRetry={fetchProducts} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Warehouse className="h-7 w-7 text-primary" />
          Inventory Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage your stock levels</p>
      </div>

      {/* Low stock alert */}
      {!loading && lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <span className="font-semibold">{lowStockCount} product{lowStockCount !== 1 ? 's' : ''}</span>{' '}
            {lowStockCount === 1 ? 'is' : 'are'} running low on stock. Consider restocking soon.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-accent/30 border-border/50"
        />
      </div>

      {/* Table or states */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          type={debouncedSearch ? 'search' : 'products'}
          description={
            debouncedSearch
              ? `No products found for "${debouncedSearch}"`
              : 'Add products to start tracking inventory.'
          }
          actionLabel={debouncedSearch ? 'Clear search' : undefined}
          onAction={debouncedSearch ? () => setSearch('') : undefined}
          className="glass rounded-xl border border-border/50"
        />
      ) : (
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Product</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">SKU</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Stock</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Level</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const level = getStockLevel(product.stock);
                const maxStock = 200;
                return (
                  <TableRow key={product.id} className="border-border/30 hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-border/50"
                        />
                        <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.id.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="w-24 space-y-1">
                        <span className={cn('text-sm font-semibold', product.stock <= 10 ? 'text-destructive' : product.stock <= 30 ? 'text-amber-600 dark:text-amber-400' : '')}>
                          {product.stock}
                        </span>
                        <Progress value={(product.stock / maxStock) * 100} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px]', level.className)}>
                        {level.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          product.status === 'active' ? 'status-active' : 'status-pending'
                        )}
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="border-border/50 text-xs">
                        <Edit className="h-3 w-3 mr-1" /> Update
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
