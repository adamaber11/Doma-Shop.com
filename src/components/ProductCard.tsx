'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { ShoppingCart, Eye } from 'lucide-react';
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
            <div className="relative w-full h-80 overflow-hidden">
                <Image
                src={imageUrl}
                alt={product.name}
                width={600}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={imageHint}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Eye className="h-10 w-10 text-white" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-headline text-lg mb-1 h-12 overflow-hidden group-hover:text-primary">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-1 shrink-0 pt-1">
                <StarRating rating={product.rating} />
                <span className="text-xs text-muted-foreground">({product.rating})</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-destructive">
            {product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-[2.5rem]">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
            <Button 
                onClick={handleAddToCart} 
                aria-label={`Add ${product.name} to cart`}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 rounded-full"
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                أضف إلى العربة
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
