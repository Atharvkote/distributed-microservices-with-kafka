import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar, { type FilterState, type CategoryOption } from '@/components/product/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { useProductsQuery, useCategoriesQuery } from '@/hooks/useCatalog';
import { mapCatalogListItem } from '@/lib/catalog-mappers';

const ProductCardSkeleton: React.FC = () => (
  <div className="glass rounded-xl border border-border/50 overflow-hidden">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="p-4 space-y-2.5">
      <Skeleton className="h-2.5 w-16 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-3 w-24 rounded" />
      <div className="flex items-center gap-1 pt-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-2.5 rounded-sm" />
        ))}
      </div>
    </div>
  </div>
);

const ProductListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') ?? undefined;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState<FilterState>({
    categories: urlCategory ? [urlCategory] : [],
    priceRange: [0, 100_000],
    minRating: 0,
  });

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (urlCategory) {
      setFilters((f) => ({ ...f, categories: [urlCategory] }));
    }
  }, [urlCategory]);

  const categoryParam =
    filters.categories.length > 0 ? filters.categories.join(',') : undefined;

  const { data: catData = [] } = useCategoriesQuery();
  const categoryOptions: CategoryOption[] = useMemo(
    () => catData.map((c) => ({ id: c._id, name: c.name })),
    [catData]
  );

  const { data, isLoading, isError, refetch, isFetching } = useProductsQuery({
    page,
    limit: 12,
    category: categoryParam,
    search: debouncedSearch || undefined,
    minRating: filters.minRating > 0 ? filters.minRating : undefined,
  });

  const onFilterChange = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const uiProducts = useMemo(() => (data?.data ?? []).map(mapCatalogListItem), [data]);

  const sorted = useMemo(() => {
    return [...uiProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [uiProducts, sortBy]);

  const totalPages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.total ?? 0;

  useEffect(() => {
    if (isError) toast.error('Failed to load products');
  }, [isError]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        {isLoading ? (
          <Skeleton className="h-4 w-36 rounded" />
        ) : (
          <p className="text-muted-foreground">{total} products (catalog)</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-accent/30 border-border/50"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
          <SelectTrigger className="w-[160px] bg-accent/30 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="glass-strong">
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden border-border/50">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] glass-strong p-4">
            <FilterSidebar
              filters={filters}
              categoryOptions={categoryOptions}
              onFilterChange={onFilterChange}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-[260px] shrink-0">
          <FilterSidebar
            className="sticky top-24"
            filters={filters}
            categoryOptions={categoryOptions}
            onFilterChange={onFilterChange}
          />
        </div>

        <div className="flex-1">
          {isError ? (
            <ErrorState onRetry={() => refetch()} className="glass rounded-2xl border border-border/50" />
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              type={debouncedSearch ? 'search' : 'products'}
              description={
                debouncedSearch
                  ? `No products match filters for "${debouncedSearch}"`
                  : 'No products available.'
              }
              actionLabel={debouncedSearch ? 'Clear search' : undefined}
              onAction={debouncedSearch ? () => setSearch('') : undefined}
              className="glass rounded-2xl border border-border/50"
            />
          ) : (
            <>
              {isFetching && !isLoading && (
                <p className="text-xs text-muted-foreground mb-2">Updating…</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    category={product.category}
                    vendorName={product.vendorName}
                    vendorLogo={product.vendorLogo}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={page === i + 1}
                            onClick={() => setPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
