'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import StarRating from '@/components/StarRating';
import { Separator } from '@/components/ui/separator';
import AddToCartButton from '@/components/AddToCartButton';
import ProductRecommendations from '@/components/ProductRecommendations';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', params.id) : null),
    [firestore, params.id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-4">
                <Skeleton className="w-full h-[600px] rounded-lg" />
                <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                </div>
            </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Separator />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }
  
  const selectedImageUrl = product.imageUrls?.[selectedImageIndex] || '';
  const selectedImageHint = product.imageHints?.[selectedImageIndex] || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <Image
              src={selectedImageUrl}
              alt={product.name}
              width={600}
              height={800}
              className="w-full h-auto object-cover rounded-md"
              data-ai-hint={selectedImageHint}
            />
          </div>
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-4">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'w-20 h-20 rounded-md overflow-hidden border-2 transition-all',
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <Image
                    src={url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    data-ai-hint={product.imageHints?.[index]}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold">{product.name}</h1>
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">({product.rating.toFixed(1)})</span>
            </div>
          </div>
          <p className="text-3xl font-semibold">
            {product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
          </p>
          <Separator />
          <p className="text-lg leading-relaxed">{product.description}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
      
      <Separator />

      <ProductRecommendations currentProduct={product} />
    </div>
  );
}
