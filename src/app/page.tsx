
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useCollection, useDoc } from '@/firebase';
import { collection, query, limit, where, doc, startAfter, getDocs } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product, HeroSection, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from 'react';

function HeroSectionSkeleton() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-secondary shadow-lg">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center text-center p-6 md:items-end md:p-12 md:text-right">
        <div className="container mx-auto">
          <div className="max-w-md space-y-4">
            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto md:mx-0" />
            <Skeleton className="h-5 md:h-6 w-full mx-auto md:mx-0" />
            <Skeleton className="h-5 md:h-6 w-5/6 mx-auto md:mx-0" />
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ categories, isLoading }: { categories: Category[] | null, isLoading: boolean }) {
  return (
    <section className="bg-card py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                          <Skeleton className="h-64 w-full" />
                      </div>
                  ))
              ) : (
                  categories?.map((category) => (
                      <Link key={category.id} href={`/category/${encodeURIComponent(category.name)}`} className="group block">
                          <div className="relative overflow-hidden rounded-lg shadow-md aspect-[4/5] border-4 border-white">
                              {category.imageUrl ? (
                                <Image
                                    src={category.imageUrl}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    data-ai-hint={category.imageHint || 'category image'}
                                />
                              ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                  <span className="text-muted-foreground">No Image</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-transparent group-hover:bg-black/50 transition-colors duration-300" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                      <h3 className="font-headline text-3xl font-bold drop-shadow-lg">{category.name}</h3>
                                      {category.description && (
                                        <p className="mt-2 text-sm max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {category.description}
                                        </p>
                                      )}
                                      {category.callToActionText && (
                                        <Button variant="outline" className="mt-4 bg-transparent text-white border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:text-black">
                                            {category.callToActionText}
                                        </Button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </Link>
                  ))
              )}
          </div>
      </div>
    </section>
  )
}

export default function Home() {
  const firestore = useFirestore();
  
  const [categories1, setCategories1] = useState<Category[] | null>(null);
  const [categories2, setCategories2] = useState<Category[] | null>(null);
  const [categories3, setCategories3] = useState<Category[] | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const heroSectionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'heroSection') : null),
    [firestore]
  );
  const { data: heroData, isLoading: isLoadingHero } = useDoc<HeroSection>(heroSectionRef);

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), where('isFeatured', '==', true), limit(8)) : null),
    [firestore]
  );
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const bestSellersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), where('isBestSeller', '==', true), limit(8)) : null),
    [firestore]
  );
  const { data: bestSellers, isLoading: isLoadingBestSellers } = useCollection<Product>(bestSellersQuery);

  const dailyDealsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), where('isDeal', '==', true), limit(8)) : null),
    [firestore]
  );
  const { data: dailyDeals, isLoading: isLoadingDailyDeals } = useCollection<Product>(dailyDealsQuery);
  
  useEffect(() => {
    async function fetchCategories() {
      if (!firestore) return;
      setIsLoadingCategories(true);
      try {
        let lastVisible: any = null;
        
        // Fetch first set
        const q1 = query(collection(firestore, 'categories'), where('parentId', '==', null), limit(3));
        const snapshot1 = await getDocs(q1);
        const cats1 = snapshot1.docs.map(d => ({id: d.id, ...d.data()} as Category));
        setCategories1(cats1);
        lastVisible = snapshot1.docs.length > 0 ? snapshot1.docs[snapshot1.docs.length-1] : null;

        // Fetch second set
        if (lastVisible) {
          const q2 = query(collection(firestore, 'categories'), where('parentId', '==', null), startAfter(lastVisible), limit(3));
          const snapshot2 = await getDocs(q2);
          const cats2 = snapshot2.docs.map(d => ({id: d.id, ...d.data()} as Category));
          setCategories2(cats2);
          lastVisible = snapshot2.docs.length > 0 ? snapshot2.docs[snapshot2.docs.length-1] : null;
        }

         // Fetch third set
         if (lastVisible) {
          const q3 = query(collection(firestore, 'categories'), where('parentId', '==', null), startAfter(lastVisible), limit(3));
          const snapshot3 = await getDocs(q3);
          const cats3 = snapshot3.docs.map(d => ({id: d.id, ...d.data()} as Category));
          setCategories3(cats3);
        }

      } catch (error) {
        console.error("Failed to fetch categories in sequence", error);
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, [firestore]);

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      {isLoadingHero ? (
        <HeroSectionSkeleton />
      ) : heroData ? (
        <section className="relative h-[60vh] w-full overflow-hidden bg-secondary shadow-lg">
          <Image
            src={heroData.imageUrl}
            alt={heroData.headline}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroData.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex justify-center items-center text-center p-6 md:items-end md:p-12 md:text-right">
            <div className="container mx-auto">
              <div className="max-w-md text-white mx-auto md:mx-0">
                <h1 className="font-headline text-3xl md:text-6xl font-bold !leading-tight drop-shadow-md">
                  {heroData.headline}
                </h1>
                <p className="mt-4 text-base md:text-lg text-white/90 drop-shadow">
                  {heroData.subheading}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={heroData.primaryActionLink}>{heroData.primaryActionText}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-white border-white bg-transparent hover:bg-white/10 hover:text-white">
                    <Link href={heroData.secondaryActionLink}>{heroData.secondaryActionText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="container mx-auto text-center py-20">لم يتم تكوين الواجهة الرئيسية بعد. يرجى إعدادها من لوحة التحكم.</div>
      )}

      {categories1 && categories1.length > 0 && <CategoryShowcase categories={categories1} isLoading={isLoadingCategories} />}

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full"
        >
          <CarouselContent>
            {isLoadingDailyDeals ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="space-y-2">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </CarouselItem>
              ))
            ) : (
              dailyDeals?.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full"
        >
          <CarouselContent>
            {isLoadingProducts ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </CarouselItem>
              ))
            ) : (
              products?.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>
      
      {categories2 && categories2.length > 0 && <CategoryShowcase categories={categories2} isLoading={isLoadingCategories} />}

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full"
        >
          <CarouselContent>
            {isLoadingBestSellers ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </CarouselItem>
              ))
            ) : (
              bestSellers?.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {categories3 && categories3.length > 0 && <CategoryShowcase categories={categories3} isLoading={isLoadingCategories} />}

    </div>
  );
}

    