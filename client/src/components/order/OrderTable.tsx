import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Order } from '@/services/api';

interface OrderTableProps {
  orders: Order[];
  showCustomer?: boolean;
  onViewOrder?: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, showCustomer = false, onViewOrder }) => {
  return (
    <div className="glass rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-xs font-semibold text-muted-foreground">Order ID</TableHead>
            {showCustomer && <TableHead className="text-xs font-semibold text-muted-foreground">Customer</TableHead>}
            <TableHead className="text-xs font-semibold text-muted-foreground">Items</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Total</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-border/30 hover:bg-accent/30 transition-colors">
              <TableCell className="font-mono text-xs text-primary">{order.id}</TableCell>
              {showCustomer && <TableCell className="text-sm">{order.customerName}</TableCell>}
              <TableCell className="text-sm">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </TableCell>
              <TableCell className="font-semibold text-sm">${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-[10px]', statusStyles[order.status])}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{order.createdAt}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-strong">
                    <DropdownMenuItem onClick={() => onViewOrder?.(order.id)} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(OrderTable);
