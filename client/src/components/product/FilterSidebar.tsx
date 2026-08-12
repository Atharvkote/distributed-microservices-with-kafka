import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Star, X, SlidersHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const fallbackCategories = ['Electronics', 'Fashion', 'Home & Decor', 'Sports', 'Food & Drink', 'Books', 'Beauty'];

export interface CategoryOption {
  id: string;
  name: string;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
}

interface FilterSidebarProps {
  className?: string;
  /** Controlled filter state (required). */
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  /** When set, category values are Mongo ids (API filter). */
  categoryOptions?: CategoryOption[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  className,
  filters,
  onFilterChange,
  categoryOptions,
}) => {
  const { categories: selectedCategories, priceRange, minRating } = filters;

  const labels = categoryOptions?.length
    ? categoryOptions
    : fallbackCategories.map((name) => ({ id: name, name }));

  const handleCategoryToggle = (id: string) => {
    const updated = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    onFilterChange({ categories: updated, priceRange, minRating });
  };

  const handleClearAll = () => {
    onFilterChange({ categories: [], priceRange, minRating: 0 });
  };

  return (
    <Card className={cn('glass border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary h-auto py-1"
            onClick={handleClearAll}
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h4>
          <div className="space-y-2">
            {labels.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => handleCategoryToggle(cat.id)}
                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`cat-${cat.id}`}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minimum Rating</h4>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  const next = star === minRating ? 0 : star;
                  onFilterChange({ categories: selectedCategories, priceRange, minRating: next });
                }}
                className="p-1 rounded-md hover:bg-accent/50 transition-colors"
              >
                <Star
                  className={cn(
                    'h-5 w-5',
                    star <= minRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(FilterSidebar);
