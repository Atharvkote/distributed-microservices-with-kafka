import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { vendorPaths } from '@/lib/vendor-paths';
import { useVendorProductsQuery, useDeleteProductMutation } from '@/hooks/useVendorCatalog';

const ProductManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const isActiveParam = filter === 'all' ? undefined : filter === 'active' ? 'true' : 'false';
  const { data, isLoading, isError, refetch } = useVendorProductsQuery(page, isActiveParam);
  const deleteProduct = useDeleteProductMutation();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Your catalog on the marketplace</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[160px] bg-accent/30">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>                   
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild className="gradient-primary">
            <Link to={vendorPaths.productsNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add product
            </Link>
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          type="products"
          title="No products yet"
          description="Create a product, then add variants and stock."
        />
      ) : (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.map((p) => {
              const thumb = p.image || p.images?.[0];
              return (
                <div
                  key={p._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/40 bg-accent/5 hover:border-primary/30 transition-colors"
                >
                  <Link to={vendorPaths.product(p._id)} className="min-w-0 flex-1 group">
                    <div className="flex items-center gap-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.title}
                          className="h-10 w-10 rounded-lg object-cover border border-border/50 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-border/50 bg-accent/30 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium group-hover:text-primary transition-colors">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.isActive === false ? 'Inactive' : 'Active'}
                          {p.priceRange
                            ? ` · from ${p.priceRange.minPrice} – ${p.priceRange.maxPrice}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button type="button" variant="outline" size="sm" className="border-border/50" asChild>
                      <Link to={vendorPaths.productEdit(p._id)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setPendingDelete({ id: p._id, title: p.title })}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                    <Link
                      to={vendorPaths.product(p._id)}
                      className="text-xs text-primary px-2 py-1.5 whitespace-nowrap"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex gap-4 justify-center text-sm">
          <button
            type="button"
            className="text-primary disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            {page} / {data.pagination.totalPages}
          </span>
          <button
            type="button"
            className="text-primary disabled:opacity-40"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” will be soft-deactivated along with its variants.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProduct.isPending || !pendingDelete}
              onClick={(e) => {
                e.preventDefault();
                if (!pendingDelete) return;
                deleteProduct.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                });
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
