import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const featuredProducts = products.slice(0, 8);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="space-y-12">
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden rounded-lg bg-secondary shadow-lg">
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
      </section>

      <section id="featured-products">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">
          منتجاتنا المميزة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
