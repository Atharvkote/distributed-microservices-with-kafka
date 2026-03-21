import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Vendor } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Star, Search, CheckCircle2, XCircle, Store, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.vendors.getAll();
      setVendors(data);
    } catch {
      setError(true);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [vendors, statusFilter, search]);

  const handleApprove = useCallback(async () => {
    if (!selectedVendor) return;
    setApprovingId(selectedVendor.id);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setVendors((prev) =>
        prev.map((v) => (v.id === selectedVendor.id ? { ...v, status: 'active' as const } : v))
      );
      toast.success(`${selectedVendor.name} has been approved as a vendor`);
      setApproveDialogOpen(false);
    } catch {
      toast.error('Failed to approve vendor');
    } finally {
      setApprovingId(null);
    }
  }, [selectedVendor]);

  if (error) {
    return <ErrorState onRetry={fetchVendors} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Store className="h-7 w-7 text-primary" />
          Vendor Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {loading ? 'Loading...' : `${filtered.length} vendor${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or states */}
      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          type={search || statusFilter !== 'all' ? 'results' : 'vendors'}
          description={
            search
              ? `No vendors matching "${search}"`
              : statusFilter !== 'all'
              ? `No "${statusFilter}" vendors.`
              : 'No vendors registered yet.'
          }
          actionLabel={search || statusFilter !== 'all' ? 'Clear filters' : undefined}
          onAction={
            search || statusFilter !== 'all'
              ? () => { setSearch(''); setStatusFilter('all'); }
              : undefined
          }
          className="glass rounded-xl border border-border/50"
        />
      ) : (
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Rating</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Products</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Total Sales</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Joined</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((vendor) => (
                <TableRow key={vendor.id} className="border-border/30 hover:bg-accent/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-primary/20">
                        <AvatarImage src={vendor.avatar} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                          {vendor.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{vendor.productCount}</TableCell>
                  <TableCell className="text-sm font-semibold">
                    ${vendor.totalSales.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{vendor.joinedAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        vendor.status === 'active' && 'status-active',
                        vendor.status === 'pending' && 'status-pending',
                        vendor.status === 'suspended' && 'status-rejected'
                      )}
                    >
                      {vendor.status}
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {vendor.status === 'pending' && (
                          <DropdownMenuItem
                            className="text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            onClick={() => { setSelectedVendor(vendor); setApproveDialogOpen(true); }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer">
                          <XCircle className="h-4 w-4 mr-2" /> Suspend
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader>
            <DialogTitle>Approve Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <span className="font-semibold text-foreground">{selectedVendor?.name}</span>?
              They will be able to list products on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              loading={!!approvingId}
              onClick={handleApprove}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
