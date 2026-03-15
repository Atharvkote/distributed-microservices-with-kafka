import React, { useState, useEffect } from 'react';
import { api, type Product } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Warehouse, Search, AlertTriangle, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    api.products.getAll().then(setProducts);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const getStockLevel = (stock: number) => {
    if (stock <= 10) return { label: 'Critical', color: 'bg-red-500/10 text-red-400 border-red-500/20', progress: 'bg-red-500' };
    if (stock <= 30) return { label: 'Low', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', progress: 'bg-amber-500' };
    return { label: 'In Stock', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', progress: 'bg-emerald-500' };
  };

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
      {filtered.some((p) => p.stock <= 10) && (
        <div className="flex items-center gap-3 p-4 glass rounded-xl border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-400">
            <span className="font-semibold">{filtered.filter((p) => p.stock <= 10).length} products</span> are running low on stock. Consider restocking soon.
          </p>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-accent/30 border-border/50"
        />
      </div>

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
                      <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover border border-border/50" />
                      <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.id.toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="w-24 space-y-1">
                      <span className="text-sm font-semibold">{product.stock}</span>
                      <Progress value={(product.stock / maxStock) * 100} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px]', level.color)}>
                      {level.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px]',
                      product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>
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
    </div>
  );
};

export default InventoryPage;
