import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Product } from '@/services/api';

interface ProductTableProps {
  products: Product[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showVendor?: boolean;
  showActions?: boolean;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ProductTable: React.FC<ProductTableProps> = ({
  products, onEdit, onDelete, showVendor = false, showActions = true,
}) => {
  return (
    <div className="glass rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-xs font-semibold text-muted-foreground">Product</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
            {showVendor && <TableHead className="text-xs font-semibold text-muted-foreground">Vendor</TableHead>}
            <TableHead className="text-xs font-semibold text-muted-foreground">Price</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Stock</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            {showActions && (
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-border/30 hover:bg-accent/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover border border-border/50"
                  />
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
              {showVendor && <TableCell className="text-sm">{product.vendorName}</TableCell>}
              <TableCell className="font-semibold text-sm">${product.price.toFixed(2)}</TableCell>
              <TableCell>
                <span className={cn(
                  'text-sm font-medium',
                  product.stock < 20 ? 'text-amber-400' : product.stock < 10 ? 'text-red-400' : ''
                )}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-[10px]', statusStyles[product.status])}>
                  {product.status}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-strong">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(product.id)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete?.(product.id)} className="text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(ProductTable);
