import React from 'react';
import {
  Package, ShoppingCart, ClipboardList, Users, Store,
  Inbox, Search, FileX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyType =
  | 'orders'
  | 'products'
  | 'vendors'
  | 'customers'
  | 'search'
  | 'generic'
  | 'results';

interface EmptyStateProps {
  /** Predefined context to auto-select icon & messages */
  type?: EmptyType;
  /** Override the title */
  title?: string;
  /** Override the description */
  description?: string;
  /** Optional CTA button label */
  actionLabel?: string;
  /** Optional CTA button handler */
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<EmptyType, React.ElementType> = {
  orders: ClipboardList,
  products: Package,
  vendors: Store,
  customers: Users,
  search: Search,
  results: FileX,
  generic: Inbox,
};

const defaultContent: Record<EmptyType, { title: string; description: string }> = {
  orders: {
    title: 'No orders yet',
    description: 'Orders placed by customers will appear here.',
  },
  products: {
    title: 'No products found',
    description: 'Add your first product to start selling on Vendex.',
  },
  vendors: {
    title: 'No vendors found',
    description: 'Vendor applications and active vendors will appear here.',
  },
  customers: {
    title: 'No customers yet',
    description: 'Customer accounts will appear here once they sign up.',
  },
  search: {
    title: 'No results for your search',
    description: 'Try adjusting your search terms or filters.',
  },
  results: {
    title: 'No results match',
    description: 'Try changing the filters or search query.',
  },
  generic: {
    title: 'Nothing here yet',
    description: 'Data will appear here once it becomes available.',
  },
};

/**
 * EmptyState — shown whenever data is empty after a successful API call.
 *
 * Usage:
 *   <EmptyState type="orders" actionLabel="Browse products" onAction={() => navigate('/products')} />
 *   <EmptyState type="search" />
 *   <EmptyState title="No results" description="..." />
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  const Icon = iconMap[type];
  const defaults = defaultContent[type];
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className
      )}
    >
      {/* Icon container */}
      <div className="h-16 w-16 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-sm text-foreground">{displayTitle}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{displayDescription}</p>
      </div>

      {/* Action */}
      {actionLabel && onAction && (
        <Button
          variant="default"
          size="sm"
          onClick={onAction}
          className="mt-1"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default React.memo(EmptyState);
