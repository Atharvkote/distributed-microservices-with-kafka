import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Star, X, SlidersHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const categories = ['Electronics', 'Fashion', 'Home & Decor', 'Sports', 'Food & Drink', 'Books', 'Beauty'];

interface FilterSidebarProps {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ className, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);

  const handleCategoryToggle = (cat: string) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(updated);
    onFilterChange?.({ categories: updated, priceRange, minRating });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500]);
    setMinRating(0);
    onFilterChange?.({ categories: [], priceRange: [0, 500], minRating: 0 });
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
        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => handleCategoryToggle(cat)}
                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor={`cat-${cat}`} className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Price Range */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Range</h4>
          <Slider
            value={priceRange}
            min={0}
            max={500}
            step={10}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            className="py-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Rating */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Rating</h4>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r === minRating ? 0 : r)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star className={cn(
                  'h-5 w-5 transition-colors',
                  r <= minRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                )} />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(FilterSidebar);
