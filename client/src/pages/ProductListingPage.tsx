import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Product } from '@/services/api';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

/** Skeleton for a single product card */
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
        <Skeleton className="h-2.5 w-8 rounded ml-1" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-3.5 w-12 rounded" />
      </div>
    </div>
  </div>
);

const ProductListingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

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

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [products, debouncedSearch]
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });
  }, [filtered, sortBy]);

  const pagination = usePagination({ totalItems: sorted.length, itemsPerPage: 8 });
  const paginatedProducts = useMemo(
    () => sorted.slice(pagination.startIndex, pagination.endIndex),
    [sorted, pagination.startIndex, pagination.endIndex]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        {loading ? (
          <Skeleton className="h-4 w-36 rounded" />
        ) : (
          <p className="text-muted-foreground">{filtered.length} products found</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-accent/30 border-border/50"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
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

        {/* Mobile filter toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden border-border/50">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] glass-strong p-4">
            <FilterSidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <FilterSidebar className="sticky top-24" />
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {error ? (
            <ErrorState onRetry={fetchProducts} className="glass rounded-2xl border border-border/50" />
          ) : loading ? (
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
                  ? `No products found for "${debouncedSearch}"`
                  : 'No products available. Check back soon.'
              }
              actionLabel={debouncedSearch ? 'Clear search' : undefined}
              onAction={debouncedSearch ? () => setSearch('') : undefined}
              className="glass rounded-2xl border border-border/50"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
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
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => pagination.prevPage()}
                          className={!pagination.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={pagination.currentPage === i + 1}
                            onClick={() => pagination.goToPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => pagination.nextPage()}
                          className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
