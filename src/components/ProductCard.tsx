'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes, user must go to product page to select one
    if (product.sizes && product.sizes.length > 0) {
        router.push(`/products/${product.id}`);
        return;
    }

    addToCart(product, 1);
    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `1 x ${product.name}`,
    });
  };

  const imageUrl = product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800';
  const imageHint = product.imageHints?.[0] || 'product';

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="p-0 relative">
            <Image
              src={imageUrl}
              alt={product.name}
              width={600}
              height={800}
              className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={imageHint}
            />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-xl mb-2 h-14 overflow-hidden group-hover:text-primary">
            {product.name}
          </CardTitle>
          <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-xs text-muted-foreground">({product.rating})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-lg font-semibold text-primary">
            {product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
          </p>        
          <Button variant="outline" size="icon" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
