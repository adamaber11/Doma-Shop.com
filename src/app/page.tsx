'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product, Brand } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function Home() {
  const firestore = useFirestore();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), limit(8)) : null),
    [firestore]
  );
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const brandsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'brands'), limit(5)) : null),
    [firestore]
  );
  const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);

  return (
    <div className="flex flex-col" style={{gap: '5px'}}>
      <section className="relative h-[calc(60vh+20px)] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-secondary shadow-lg" style={{ marginTop: '5px' }}>
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
              <div className="flex items-center gap-4 mt-6">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="#featured-products">تسوق الآن</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white/10 hover:text-white">
                  <Link href="/about">من نحن</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl font-bold text-center mb-8">
            أشهر العلامات التجارية
          </h2>
          {isLoadingBrands ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-center gap-2">
                        <Skeleton className="h-16 w-32" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center">
                {brands?.map((brand) => (
                <div key={brand.id} className="flex flex-col items-center justify-center gap-2 text-center p-4 rounded-lg hover:bg-secondary transition-colors">
                    <Image
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    width={200}
                    height={100}
                    className="object-contain h-16"
                    data-ai-hint={brand.logoHint}
                    />
                    <p className="font-semibold mt-2">{brand.name}</p>
                </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <section id="featured-products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          منتجاتنا المميزة
        </h2>
        {isLoadingProducts ? (
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
