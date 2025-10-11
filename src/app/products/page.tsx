'use client';

import ProductCard from '@/components/ProductCard';
import { useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AllProductsPage() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products')) : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        جميع المنتجات
      </h1>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">لم يتم العثور على منتجات.</p>
        </div>
      )}
    </div>
  );
}
