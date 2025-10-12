'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useCollection, useDoc } from '@/firebase';
import { collection, query, limit, where, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product, Brand, HeroSection, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function HeroSectionSkeleton() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-secondary shadow-lg">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-end p-4 md:p-12">
        <div className="container mx-auto">
          <div className="max-w-md space-y-4">
            <Skeleton className="h-12 md:h-16 w-3/4" />
            <Skeleton className="h-5 md:h-6 w-full" />
            <Skeleton className="h-5 md:h-6 w-5/6" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const firestore = useFirestore();

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

  const brandsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'brands'), limit(12)) : null),
    [firestore]
  );
  const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'categories'), where('parentId', '==', null), limit(4)) : null),
    [firestore]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const categoryImages = [
    { url: 'https://picsum.photos/seed/cat1/600/400', hint: 'mens fashion' },
    { url: 'https://picsum.photos/seed/cat2/600/400', hint: 'womens fashion' },
    { url: 'https://picsum.photos/seed/cat3/600/400', hint: 'modern electronics' },
    { url: 'https://picsum.photos/seed/cat4/600/400', hint: 'home decor' },
  ];

  return (
    <div className="flex flex-col gap-5">
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
          <div className="absolute inset-0 flex items-end p-4 md:p-12">
            <div className="container mx-auto">
              <div className="max-w-md text-white">
                <h1 className="font-headline text-4xl md:text-6xl font-bold !leading-tight drop-shadow-md">
                  {heroData.headline}
                </h1>
                <p className="mt-4 text-base md:text-lg text-primary-foreground/90 drop-shadow">
                  {heroData.subheading}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={heroData.primaryActionLink}>{heroData.primaryActionText}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white/10 hover:text-white">
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

      <section className="bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl font-bold text-center mb-8">
            أشهر العلامات التجارية
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: "rtl",
              dragFree: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-1">
              {isLoadingBrands ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <CarouselItem key={index} className="basis-1/3 sm:basis-1/4 md:basis-1/6 pl-1" style={{paddingLeft: '2.5px', paddingRight: '2.5px'}}>
                     <div className="flex flex-col items-center justify-center gap-2">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                brands?.map((brand) => (
                  <CarouselItem key={brand.id} className="basis-1/3 sm:basis-1/4 md:basis-1/6" style={{paddingLeft: '2.5px', paddingRight: '2.5px'}}>
                     <Link href={`/brand/${encodeURIComponent(brand.name)}`} className="flex flex-col items-center justify-center gap-2 text-center p-4 rounded-lg transition-all">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center p-2 group relative overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all duration-300">
                            <Image
                            src={brand.logoUrl}
                            alt={`${brand.name} logo`}
                            width={80}
                            height={80}
                            className="object-contain transition-transform duration-300 group-hover:scale-110"
                            data-ai-hint={brand.logoHint}
                            />
                        </div>
                        <p className="font-semibold mt-2 text-sm text-center">{brand.name}</p>
                    </Link>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      <section id="daily-deals" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          العروض اليومية
        </h2>
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full max-w-6xl mx-auto"
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
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section id="featured-products" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          منتجاتنا المميزة
        </h2>
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {isLoadingProducts ? (
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
              products?.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section id="shop-by-category" className="bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">
                تسوق حسب الفئة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingCategories ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-6 w-3/4 mx-auto" />
                        </div>
                    ))
                ) : (
                    categories?.map((category, index) => (
                        <Link key={category.id} href={`/category/${encodeURIComponent(category.name)}`} className="group block">
                            <div className="relative overflow-hidden rounded-lg shadow-md aspect-video">
                                <Image
                                    src={categoryImages[index % categoryImages.length].url}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    data-ai-hint={categoryImages[index % categoryImages.length].hint}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <h3 className="font-headline text-2xl font-bold text-white drop-shadow-lg">{category.name}</h3>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
      </section>

      <section id="best-sellers" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          الأكثر مبيعًا
        </h2>
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {isLoadingBestSellers ? (
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
              bestSellers?.map((product) => (
                <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

    </div>
  );
}
