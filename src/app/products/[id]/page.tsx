import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/data';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AddToCartButton from '@/components/AddToCartButton';
import ProductRecommendations from '@/components/ProductRecommendations';

export function generateMetadata({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={800}
            className="w-full h-auto object-cover rounded-md"
            data-ai-hint={product.imageHint}
          />
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
