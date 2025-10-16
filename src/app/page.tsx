
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { collection, query, limit, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server';
import type { Product, HeroSection, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

async function getHomePageData() {
    try {
        const heroDocRef = doc(firestore, 'settings', 'heroSection');
        const productsQuery = query(collection(firestore, 'products'), where('isFeatured', '==', true), limit(8));
        const bestSellersQuery = query(collection(firestore, 'products'), where('isBestSeller', '==', true), limit(8));
        const dailyDealsQuery = query(collection(firestore, 'products'), where('isDeal', '==', true), limit(8));
        const categoriesQuery = query(collection(firestore, 'categories'), where('parentId', '==', null));

        const [
            heroSnapshot,
            productsSnapshot,
            bestSellersSnapshot,
            dailyDealsSnapshot,
            categoriesSnapshot
        ] = await Promise.all([
            getDoc(heroDocRef),
            getDocs(productsQuery),
            getDocs(bestSellersSnapshot),
            getDocs(dailyDealsSnapshot),
            getDocs(categoriesQuery),
        ]);

        const heroData = heroSnapshot.exists() ? heroSnapshot.data() as HeroSection : null;
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const bestSellers = bestSellersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const dailyDeals = dailyDealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

        return { heroData, products, bestSellers, dailyDeals, categories };
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        return { heroData: null, products: [], bestSellers: [], dailyDeals: [], categories: [] };
    }
}


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

function CategoryCarousel({ categories }: { categories: Category[] | null }) {
   if (!categories || categories.length === 0) {
        return null;
    }

  return (
    <section className="bg-card py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <Carousel
                opts={{
                    align: "start",
                    direction: "rtl",
                }}
                className="w-full"
            >
                <CarouselContent>
                    {categories?.map((category) => (
                       <CarouselItem key={category.id} className="p-2 basis-full sm:basis-1/2 lg:basis-1/3">
                        <Link href={`/category/${encodeURIComponent(category.name)}`} className="group block">
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
                       </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
            </Carousel>
      </div>
    </section>
  )
}

function ProductCarouselSection({ title, products, viewAllLink }: { title: string, products: Product[] | null, viewAllLink: string }) {
    if (!products || products.length === 0) {
        return null;
    }
    
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-3xl font-bold">{title}</h2>
                <Button asChild variant="link">
                    <Link href={viewAllLink}>عرض الكل</Link>
                </Button>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    direction: "rtl",
                }}
                className="w-full"
            >
                <CarouselContent>
                    {products?.map((product) => (
                        <CarouselItem key={product.id} className="p-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
            </Carousel>
        </section>
    );
}

export default async function Home() {
  const { heroData, products, bestSellers, dailyDeals, categories } = await getHomePageData();

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      {heroData ? (
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
         <HeroSectionSkeleton />
      )}

      <CategoryCarousel categories={categories} />
      
      <ProductCarouselSection 
        title="العروض اليومية" 
        products={dailyDeals} 
        viewAllLink="/daily-deals" 
      />

      <ProductCarouselSection 
        title="منتجات مميزة" 
        products={products} 
        viewAllLink="/products"
      />

      <ProductCarouselSection 
        title="الأكثر مبيعًا" 
        products={bestSellers} 
        viewAllLink="/best-sellers" 
      />

    </div>
  );
}
