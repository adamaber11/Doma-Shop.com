
'use client';

import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

export default function ProductRecommendations({ currentProduct }: { currentProduct: Product }) {
  const firestore = useFirestore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations() {
      if (!firestore) return;
      setIsLoading(true);

      try {
        // Query for best-selling products.
        const bestSellersQuery = query(
          collection(firestore, 'products'),
          where('isBestSeller', '==', true),
          limit(9) // Fetch a few extra items to ensure we have enough after filtering
        );

        const querySnapshot = await getDocs(bestSellersQuery);
        const bestSellers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Filter out the current product on the client-side
        const filteredRecommendations = bestSellers.filter(p => p.id !== currentProduct.id).slice(0, 8);
        setRecommendations(filteredRecommendations);

      } catch (error) {
        console.error("Failed to get product recommendations:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    getRecommendations();
  }, [firestore, currentProduct]);

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section>
      <h2 className="font-headline text-3xl font-bold text-center mb-8">
        الأكثر مبيعًا
      </h2>
       <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full"
        >
          <CarouselContent>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="p-2 basis-1/2 md:basis-1/4">
                  <div className="space-y-2">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </CarouselItem>
              ))
            ) : (
              recommendations.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-1/2 md:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
    </section>
  );
}
