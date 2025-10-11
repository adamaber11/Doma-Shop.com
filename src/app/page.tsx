'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const firestore = useFirestore();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), limit(8)) : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="space-y-12">
      <section className="relative h-[calc(60vh+20px)] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-secondary shadow-lg">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <div className="container mx-auto">
            <div className="max-w-md text-white">
              <h1 className="font-headline text-4xl md:text-6xl font-bold !leading-tight drop-shadow-md">
                فخامة تستحقها
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90 drop-shadow">
                اكتشف مجموعتنا الحصرية من المنتجات المصممة لإلهام حياتك.
              </p>
              <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="#featured-products">تسوق الآن</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          منتجاتنا المميزة
        </h2>
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-8 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
