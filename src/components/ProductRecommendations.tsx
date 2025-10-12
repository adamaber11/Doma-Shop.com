'use client';

import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export default function ProductRecommendations({ currentProduct }: { currentProduct: Product }) {
  const firestore = useFirestore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations(product: Product) {
      if (!firestore) return;
      setIsLoading(true);

      try {
        // Query for products in the same category
        const categoryQuery = query(
          collection(firestore, 'products'),
          where('category', '==', product.category),
          where('id', '!=', product.id),
          limit(4)
        );

        // Query for products of the same brand
        const brandQuery = query(
          collection(firestore, 'products'),
          where('brand', '==', product.brand),
          where('id', '!=', product.id),
          limit(4)
        );

        const [categorySnapshot, brandSnapshot] = await Promise.all([
          getDocs(categoryQuery),
          getDocs(brandQuery),
        ]);

        const categoryProducts = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const brandProducts = brandSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Combine and deduplicate results
        const combinedRecommendations = new Map<string, Product>();
        [...categoryProducts, ...brandProducts].forEach(p => {
          if (p.id !== product.id) {
            combinedRecommendations.set(p.id, p);
          }
        });
        
        // Take up to 4 unique recommendations
        const finalRecommendations = Array.from(combinedRecommendations.values()).slice(0, 4);

        setRecommendations(finalRecommendations);

      } catch (error) {
        console.error("Failed to get product recommendations:", error);
        setRecommendations([]); // Clear recommendations on error
      } finally {
        setIsLoading(false);
      }
    }

    getRecommendations(currentProduct);
  }, [firestore, currentProduct]);

  if (isLoading) {
    return (
         <section>
            <h2 className="font-headline text-3xl font-bold text-center mb-8">
                قد يعجبك أيضاً
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                </div>
                ))}
            </div>
      </section>
    )
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-headline text-3xl font-bold text-center mb-8">
        قد يعجبك أيضاً
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
