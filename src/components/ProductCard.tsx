
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { ShoppingCart, Check, Link as LinkIcon } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useQuickView } from '@/hooks/use-quick-view';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    const hasOptions = (product.sizes && product.sizes.length > 0) || (product.variants && product.variants.length > 0);

    if (hasOptions) {
        openQuickView(product); 
    } else {
        addToCart(product, 1);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(productUrl).then(() => {
        setIsLinkCopied(true);
        toast({
            title: 'تم نسخ الرابط!',
            description: 'يمكنك الآن مشاركة رابط المنتج.',
        });
        setTimeout(() => setIsLinkCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
        toast({
            variant: 'destructive',
            title: 'فشل النسخ',
            description: 'لم نتمكن من نسخ الرابط.',
        });
    });
  };
  
  const imageUrl1 = product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800';
  const imageHint1 = product.imageHints?.[0] || 'product';
  const imageUrl2 = product.imageUrls?.[1];
  const imageHint2 = product.imageHints?.[1];
  
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="block group w-full h-full cursor-pointer">
      <Card className="flex flex-col overflow-hidden h-full relative">
        <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleCopyLink}
            aria-label="Copy product link"
        >
            {isLinkCopied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
        <CardHeader className="p-0 relative">
            <div className="relative w-full aspect-square overflow-hidden">
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
                 {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                        خصم {discountPercentage}%
                    </div>
                )}
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <StarRating rating={product.rating} />
          </div>
          <CardTitle className="font-headline text-sm font-semibold group-hover:text-primary mt-1 mb-2 h-5 truncate hover:underline decoration-primary underline-offset-4">
            {product.name}
          </CardTitle>
           <div className="flex items-baseline gap-2 mt-auto">
             <p className="text-sm font-semibold text-destructive">
                {product.price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
             </p>
             {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through">
                    {product.originalPrice?.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                </p>
             )}
           </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto flex-col items-stretch gap-2">
            <Button 
                onClick={handleAddToCart} 
                aria-label={`Add ${product.name} to cart`}
                size="sm"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-8 text-xs"
            >
                <ShoppingCart className="mr-2 h-3 w-3" />
                أضف إلى العربة
            </Button>
            
            {product.cardMessageIsEnabled && product.cardMessageText ? (
              <p className={cn("text-xs text-center", product.cardMessageTextColor, product.cardMessageFontWeight)}>
                {product.cardMessageText}
              </p>
            ) : (
                <div className="h-4"></div> 
            )}

            {product.isDeal && product.dealEndDate && (
                <CountdownTimer endDate={product.dealEndDate} />
            )}
        </CardFooter>
      </Card>
    </Link>
  );
}
