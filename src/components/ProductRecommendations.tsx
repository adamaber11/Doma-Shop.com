'use client';

import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { useCollection } from '@/firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export default function ProductRecommendations({ currentProduct }: { currentProduct: Product }) {
  const firestore = useFirestore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations(currentProduct: Product) {
      if (!firestore) return;
      try {
        const productsSnapshot = await getDocs(collection(firestore, 'products'));
        const productCatalog = productsSnapshot.docs.map(doc => doc.data().name).join(', ');

        const browsingHistory = `User viewed: ${currentProduct.name}`;
        const purchaseHistory = 'User has not purchased anything yet.';

        const result = await getProductRecommendations({
          productCatalog,
          browsingHistory,
          purchaseHistory,
        });
        
        const recommendedNames = result.recommendations
          .split(',')
          .map(name => name.trim());
          
        if (recommendedNames.length > 0) {
          const q = query(
            collection(firestore, 'products'), 
            where('name', 'in', recommendedNames),
            where('name', '!=', currentProduct.name),
            limit(4)
          );
          const recommendedProductsSnapshot = await getDocs(q);
          const recommendedProducts = recommendedProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setRecommendations(recommendedProducts);
        } else {
            // Fallback to simple category-based recommendations
          const q = query(
              collection(firestore, 'products'),
              where('category', '==', currentProduct.category),
              where('id', '!=', currentProduct.id),
              limit(4)
          );
          const fallbackSnapshot = await getDocs(q);
          setRecommendations(fallbackSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Product)));
        }

      } catch (error) {
        console.error("Failed to get product recommendations:", error);
        // Fallback to simple category-based recommendations
        if (firestore) {
            const q = query(
                collection(firestore, 'products'),
                where('category', '==', currentProduct.category),
                where('id', '!=', currentProduct.id),
                limit(4)
            );
            const fallbackSnapshot = await getDocs(q);
            setRecommendations(fallbackSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Product)));
        }
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
