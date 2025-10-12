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

  const imageUrl1 = product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800';
  const imageHint1 = product.imageHints?.[0] || 'product';
  const imageUrl2 = product.imageUrls?.[1];
  const imageHint2 = product.imageHints?.[1];

  return (
    <Link href={`/products/${product.id}`} className="block group w-[250px] h-[400px]">
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="p-0 relative">
            <div className="relative w-full h-52 overflow-hidden">
                <Image
                    src={imageUrl1}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    data-ai-hint={imageHint1}
                />
                {imageUrl2 && (
                    <Image
                    src={imageUrl2}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    data-ai-hint={imageHint2 || 'product alternate'}
                    />
                )}
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <StarRating rating={product.rating} />
          </div>
          <CardTitle className="font-headline text-base h-12 overflow-hidden group-hover:text-blue-600 group-hover:underline">
            {product.name}
          </CardTitle>
           <p className="text-sm font-semibold text-destructive group-hover:text-blue-600">
            {product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
          </p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 h-[2.5rem]">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button 
                onClick={handleAddToCart} 
                aria-label={`Add ${product.name} to cart`}
                size="sm"
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 rounded-full pb-[5px]"
            >
                <ShoppingCart className="mr-2 h-4 w-4" />
                أضف إلى العربة
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
