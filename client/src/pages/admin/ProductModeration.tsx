import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Product } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, CheckCircle2, XCircle, MoreHorizontal, Shield } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

const ProductModeration: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch {
      setError(true);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [products, statusFilter, search]);

  const handleApprove = useCallback(async () => {
    if (!selectedProduct) return;
    setApprovingId(selectedProduct.id);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, status: 'active' as const } : p))
      );
      toast.success(`"${selectedProduct.name}" has been approved`);
      setReviewDialogOpen(false);
    } catch {
      toast.error('Failed to approve product');
    } finally {
      setApprovingId(null);
    }
  }, [selectedProduct]);

  if (error) {
    return <ErrorState onRetry={fetchProducts} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          Product Moderation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve vendor products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-accent/30 border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-accent/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-strong">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or states */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          type={search || statusFilter !== 'all' ? 'results' : 'products'}
          description={
            search
              ? `No products matching "${search}"`
              : statusFilter !== 'all'
              ? `No "${statusFilter}" products found.`
              : 'No products submitted for review.'
          }
          actionLabel={search || statusFilter !== 'all' ? 'Clear filters' : undefined}
          onAction={search || statusFilter !== 'all' ? () => { setSearch(''); setStatusFilter('all'); } : undefined}
          className="glass rounded-xl border border-border/50"
        />
      ) : (
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Product</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Price</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
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
                  <TableCell className="text-sm">{product.vendorName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-sm font-semibold">${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        product.status === 'active' && 'status-active',
                        product.status === 'pending' && 'status-pending',
                        product.status === 'rejected' && 'status-rejected'
                      )}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-strong">
                        <DropdownMenuItem
                          onClick={() => { setSelectedProduct(product); setReviewDialogOpen(true); }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" /> Review
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-600 dark:text-emerald-400 cursor-pointer">
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer">
                          <XCircle className="h-4 w-4 mr-2" /> Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="glass-strong border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>Review the product details and decide to approve or reject.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-20 w-20 rounded-xl object-cover border border-border/50"
                />
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.vendorName} · {selectedProduct.category}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              <div className="space-y-2">
                <Label>Review Note (optional)</Label>
                <Textarea placeholder="Add a note for the vendor..." className="bg-accent/30 border-border/50" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30"
              onClick={() => setReviewDialogOpen(false)}
            >
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>
            <Button
              variant="brand"
              loading={!!approvingId}
              onClick={handleApprove}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductModeration;
