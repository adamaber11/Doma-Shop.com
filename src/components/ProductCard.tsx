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

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: 'تمت الإضافة إلى السلة',
      description: `1 x ${product.name}`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={800}
            className="w-full h-80 object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint={product.imageHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2 h-14 overflow-hidden">
          <Link href={`/products/${product.id}`} className="hover:text-primary">
            {product.name}
          </Link>
        </CardTitle>
        <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.rating})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-semibold text-primary">
          {product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
        </p>        <Button variant="outline" size="icon" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
