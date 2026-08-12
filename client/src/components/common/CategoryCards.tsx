'use client';

import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { IoIosCart } from 'react-icons/io';
import { Package } from 'lucide-react';

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

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 justify-center">
            <IoIosCart className="text-primary text-3xl md:text-5xl" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Shop by{' '}
              <span className="carattere-regular bg-gradient-to-r from-primary text-6xl via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore our curated collection
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

          {catLoading
            ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 md:h-80 rounded-2xl" />
            ))

            : categories.slice(0, 8).map((cat, index) => {
              const Icon = iconFor(cat.name);
              const hasSub = cat.subcategories && cat.subcategories.length > 0;

              return (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className={`group ${hasSub ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                >
                  <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${hasSub ? 'h-80' : 'h-40 md:h-56'
                    }`}>

                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background border border-border/50 rounded-2xl duration-500 transition-colors group-hover:from-primary/30" />

                    {/* Content */}
                    <div className={`relative h-full flex flex-col p-6 ${hasSub ? 'justify-between' : 'items-center justify-center'
                      }`}>

                      {/* Icon */}
                      <div className='flex items-center gap-2'>

                        <div className="bg-primary rounded-xl p-4 w-fit">
                          <Package className="text-white h-8 w-8" />
                        </div>

                        {/* Title */}
                        <h3 className={`font-bold ${hasSub ? 'text-2xl' : 'text-sm'
                          }`}>
                          {cat.name}
                        </h3>
                      </div>

                      {hasSub && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {cat.subcategories!.slice(0, 4).map((sub, i) => (
                            <div
                              key={i}
                              className="font-bold px-4 tracking-widest uppercase h-16 text-primary flex items-center text-2xl justify-start bg-white/10 px-2 py-1 rounded-md"
                            >
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
}