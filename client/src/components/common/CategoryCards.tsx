'use client';

import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { HiShoppingCart } from 'react-icons/hi';
import { IoIosCart } from 'react-icons/io';

interface Category {
  _id: string;
  name: string;
  subcategories?: string[];
}

interface CategoryGridProps {
  categories: Category[];
  catLoading?: boolean;
  iconFor: (name: string) => React.ComponentType<any>;
}

export default function CategoryGrid({
  categories,
  catLoading = false,
  iconFor,
}: CategoryGridProps) {
  const getGridSpan = (cat: Category, index: number) => {
    // Make items with subcategories larger (span 2)
    const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
    if (hasSubcategories) return 2;
    
    // Otherwise follow pattern for regular items
    const pattern = [1, 1, 1, 1];
    return pattern[index % pattern.length];
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 justify-center">
            <IoIosCart className="text-primary text-3xl md:text-5xl" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Shop by{' '}
              <span className="bg-gradient-to-r from-primary text-6xl via-primary/80 to-primary/60 bg-clip-text text-transparent carattere-regular">
                Category
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore our curated collection
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-max">
          {catLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl ${i % 3 === 0 ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}
                >
                  <Skeleton className="h-40 md:h-80 rounded-2xl" />
                </div>
              ))
            : categories.slice(0, 8).map((cat, index) => {
                const Icon = iconFor(cat.name);
                const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
                const isLarge = hasSubcategories;

                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className={`group ${
                      isLarge ? 'md:col-span-2 md:row-span-2' : 'col-span-1'
                    }`}
                  >
                    <div
                      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                        isLarge ? 'h-80' : 'h-40 md:h-56'
                      }`}
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${
                          index * 0.1
                        }s both`,
                      }}
                    >
                      {/* Background with gradient - stronger on large items */}
                      <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl transition-all duration-500 ${
                        isLarge 
                          ? 'from-primary/20 via-primary/10 to-background group-hover:from-primary/40 group-hover:to-primary/20' 
                          : 'from-primary/10 via-primary/5 to-background group-hover:from-primary/25 group-hover:to-primary/10'
                      } border border-border/50 group-hover:border-primary/50`} />

                      {/* Glassmorphism effect */}
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-2xl group-hover:bg-white/10 dark:group-hover:bg-black/10 transition-all duration-500" />

                      {/* Content */}
                      <div
                        className={`relative h-full flex flex-col p-6 md:p-8 ${
                          isLarge
                            ? 'justify-between'
                            : 'items-center justify-center gap-3'
                        } group-hover:scale-105 transition-transform duration-300`}
                      >
                        {/* Icon container */}
                        <div className={isLarge ? '' : 'relative'}>
                          {!isLarge && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                          <div className={`relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl group-hover:shadow-2xl transition-shadow duration-300 ${
                            isLarge ? 'p-5 w-fit' : 'p-4'
                          }`}>
                            <Icon className={`text-white ${
                              isLarge ? 'h-10 w-10 md:h-12 md:w-12' : 'h-8 w-8 md:h-10 md:w-10'
                            }`} />
                          </div>
                        </div>

                        {/* Text */}
                        <div className={isLarge ? 'space-y-4' : 'text-center space-y-1'}>
                          <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors duration-300 ${
                            isLarge ? 'text-2xl md:text-3xl' : 'text-sm md:text-base'
                          }`}>
                            {cat.name}
                          </h3>
                          {!isLarge && (
                            <div className="h-0.5 w-0 group-hover:w-8 bg-gradient-to-r from-primary to-transparent mx-auto transition-all duration-300" />
                          )}
                        </div>

                        {/* Subcategories - only on large items */}
                        {isLarge && hasSubcategories && (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Featured Items</p>
                            <div className="grid grid-cols-2 gap-3">
                              {cat.subcategories.slice(0, 4).map((sub, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 group-hover:bg-primary/20 transition-all duration-300 text-xs font-medium text-muted-foreground group-hover:text-primary truncate"
                                >
                                  {sub}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover border glow */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
