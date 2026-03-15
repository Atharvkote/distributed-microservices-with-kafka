import React, { useState, useEffect } from 'react';
import { api, type Order } from '@/services/api';
import OrderTable from '@/components/order/OrderTable';
import MetricCard from '@/components/dashboard/MetricCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, ClipboardList, ShoppingCart, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const OrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    api.orders.getAll().then(setOrders);
  }, []);

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          Order Monitoring
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor all platform orders</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Orders" value={orders.length.toString()} icon={ShoppingCart} />
        <MetricCard title="Pending" value={orders.filter((o) => o.status === 'pending').length.toString()} icon={Clock} />
        <MetricCard title="In Transit" value={orders.filter((o) => o.status === 'shipped').length.toString()} icon={Truck} />
        <MetricCard title="Delivered" value={orders.filter((o) => o.status === 'delivered').length.toString()} icon={CheckCircle2} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-accent/30 border-border/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-accent/30 border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="glass-strong">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OrderTable orders={filtered} showCustomer />
    </div>
  );
};

export default OrderMonitoring;
