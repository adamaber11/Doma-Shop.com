'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';

export default function BrandPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const brandName = decodeURIComponent(params.slug);

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'products'),
            where('brand', '==', brandName)
          )
        : null,
    [firestore, brandName]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  // Still loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Finished loading but no products found, maybe the brand doesn't exist
  if (!products) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        منتجات {brandName}
      </h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            لا توجد منتجات متاحة لهذه العلامة التجارية حاليًا.
          </p>
        </div>
      )}
    </div>
  );
}
