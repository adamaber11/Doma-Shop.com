'use client';

import { useQuickView } from '@/hooks/use-quick-view';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import StarRating from '@/components/StarRating';
import { Separator } from '@/components/ui/separator';
import AddToCartButton from '@/components/AddToCartButton';
import ProductRecommendations from '@/components/ProductRecommendations';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import { Tag, CheckCircle, Check } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function QuickViewSkeleton() {
    return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start p-6">
            <div className="space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <div className="grid grid-cols-5 gap-2">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                </div>
            </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Separator />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <div className="pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
    );
  }

export default function ProductQuickView() {
  const { isQuickViewOpen, closeQuickView, product } = useQuickView();
  const firestore = useFirestore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const hasVariants = product.variants && product.variants.length > 0;
      setSelectedVariantIndex(hasVariants ? 0 : null);
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? undefined : '');
    }
  }, [product]);

  const currentImages = useMemo(() => {
    if (product?.variants && selectedVariantIndex !== null && product.variants[selectedVariantIndex]) {
      return product.variants[selectedVariantIndex].imageUrls;
    }
    return product?.imageUrls || [];
  }, [product, selectedVariantIndex]);

  const currentImageHints = useMemo(() => {
    if (product?.variants && selectedVariantIndex !== null && product.variants[selectedVariantIndex]) {
      return product.variants[selectedVariantIndex].imageHints;
    }
    return product?.imageHints || [];
  }, [product, selectedVariantIndex]);

  // Ensure image index is valid for current images
  useEffect(() => {
    if (selectedImageIndex >= currentImages.length) {
      setSelectedImageIndex(0);
    }
  }, [currentImages, selectedImageIndex]);


  if (!product) {
    return null;
  }

  const { name, description, price, rating, sizes, originalPrice, isDeal, dealEndDate, category, brand, material, countryOfOrigin, features, variants } = product;
  const selectedImageUrl = currentImages[selectedImageIndex] || '';
  const selectedImageHint = currentImageHints[selectedImageIndex] || '';
  const hasSizes = sizes && sizes.length > 0;
  const hasVariants = variants && variants.length > 0;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const selectedColorName = hasVariants && selectedVariantIndex !== null ? variants[selectedVariantIndex].color : undefined;
  
  return (
    <Sheet open={isQuickViewOpen} onOpenChange={closeQuickView}>
      <SheetContent side="left" className="w-full sm:max-w-4xl p-0">
        <ScrollArea className="h-full">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start p-6">
                {/* Image Gallery */}
                <div className="space-y-4">
                <div className="bg-card p-4 rounded-lg shadow-sm border relative">
                    <Image
                    src={selectedImageUrl}
                    alt={name}
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover rounded-md aspect-[3/4]"
                    data-ai-hint={selectedImageHint}
                    priority
                    />
                    {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-md">
                            خصم {discountPercentage}%
                        </div>
                    )}
                </div>
                {currentImages && currentImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                    {currentImages.map((url, index) => (
                        <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                            'aspect-square rounded-md overflow-hidden border-2 transition-all',
                            selectedImageIndex === index ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-primary/50'
                        )}
                        >
                        <Image
                            src={url}
                            alt={`${name} thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                            data-ai-hint={currentImageHints?.[index]}
                        />
                        </button>
                    ))}
                    </div>
                )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex gap-4 items-center text-sm text-muted-foreground">
                        <Link onClick={closeQuickView} href={`/category/${encodeURIComponent(category)}`} className="hover:text-primary hover:underline flex items-center gap-1">
                            <Tag className="w-4 h-4" /> {category}
                        </Link>
                        <span>/</span>
                        <Link onClick={closeQuickView} href={`/brand/${encodeURIComponent(brand)}`} className="hover:text-primary hover:underline">
                            {brand}
                        </Link>
                    </div>
                    <SheetHeader>
                        <SheetTitle className="text-4xl font-headline font-bold text-right">{name}</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-2">
                    <StarRating rating={rating} />
                    <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-semibold text-destructive">
                        {price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
                    </p>
                    {hasDiscount && (
                        <p className="text-xl text-muted-foreground line-through">
                            {originalPrice?.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
                        </p>
                    )}
                </div>
                <Separator />

                <SheetDescription className="text-muted-foreground leading-relaxed text-right">{description}</SheetDescription>
                
                <div className="space-y-4 pt-2">
                    {(material || countryOfOrigin) && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {material && (
                                <div>
                                    <h4 className="font-semibold">الخامة</h4>
                                    <p className="text-muted-foreground">{material}</p>
                                </div>
                            )}
                            {countryOfOrigin && (
                                <div>
                                    <h4 className="font-semibold">بلد الصنع</h4>
                                    <p className="text-muted-foreground">{countryOfOrigin}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {features && features.length > 0 && (
                         <div>
                            <h4 className="font-semibold mb-2">ميزات إضافية</h4>
                            <ul className="space-y-2">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {hasVariants && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground">اللون:</h3>
                            <span className="text-sm text-muted-foreground">{selectedColorName}</span>
                        </div>
                         <TooltipProvider>
                            <div className="flex flex-wrap gap-2">
                                {variants.map((variant, index) => (
                                    <Tooltip key={variant.color}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setSelectedVariantIndex(index)}
                                                className={cn(
                                                    'h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center',
                                                    selectedVariantIndex === index ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-primary/50'
                                                )}
                                                style={{ backgroundColor: variant.hex }}
                                                aria-label={`Select color ${variant.color}`}
                                            >
                                                {selectedVariantIndex === index && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{variant.color}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                )}

                {hasSizes && (
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-medium text-foreground">المقاسات</h3>
                        <div className="flex flex-wrap gap-2">
                            {sizes?.map(size => (
                                <Button 
                                    key={size}
                                    variant={selectedSize === size ? "default" : "outline"}
                                    onClick={() => setSelectedSize(size)}
                                    className="px-4 py-2"
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 space-y-4">
                    <AddToCartButton product={product} selectedSize={selectedSize} selectedColor={selectedColorName} />
                    {isDeal && dealEndDate && <CountdownTimer endDate={dealEndDate} />}
                </div>

                <div className="pt-4">
                    <Button asChild variant="link" className="p-0" onClick={closeQuickView}>
                        <Link href={`/products/${product.id}`}>عرض صفحة المنتج الكاملة →</Link>
                    </Button>
                </div>
                </div>
            </div>
            
            <div className='p-6'>
                <Separator />
            </div>

            <div className='p-6 pt-0'>
                {firestore && <ProductRecommendations currentProduct={product} />}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
