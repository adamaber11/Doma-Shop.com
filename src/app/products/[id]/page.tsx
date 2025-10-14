'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import ProductQuickViewContent from '@/components/ProductQuickViewContent';
import { Skeleton } from '@/components/ui/skeleton';


interface PageProps {
  params: { id: string };
}

function ProductPageSkeleton() {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <div className="grid grid-cols-5 gap-2">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                </div>
            </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <div className="border-t pt-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
}


export default function ProductPage({ params }: PageProps) {
  const firestore = useFirestore();
  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', params.id) : null),
    [firestore, params.id]
  );
  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    console.error("Error fetching product:", error);
    return <div className="text-center py-20">حدث خطأ أثناء جلب بيانات المنتج.</div>;
  }
  
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <ProductQuickViewContent product={product} />
    </div>
  );
}
