'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import StarRating from '@/components/StarRating';
import { Separator } from '@/components/ui/separator';
import AddToCartButton from '@/components/AddToCartButton';
import ProductRecommendations from '@/components/ProductRecommendations';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import { Tag, CheckCircle, Info, ShieldCheck, Truck, RotateCw, HandCoins } from 'lucide-react';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Reviews from './Reviews';
import { Product, ProductShippingAndService } from '@/lib/types';


const ServiceFeature = ({ icon: Icon, text, subtext }: { icon: React.ElementType, text: string, subtext?: string }) => (
    <div className="flex flex-col items-center text-center">
        <Icon className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-xs font-semibold">{text}</span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
    </div>
);


export default function ProductQuickViewContent({ product, isSheet = false }: { product: Product, isSheet?: boolean }) {
  const firestore = useFirestore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const hasSizes = product.sizes && product.sizes.length > 0;
      const hasVariants = product.variants && product.variants.length > 0;
      setSelectedVariantIndex(hasVariants ? null : -1); 
      setSelectedImageIndex(0);
      setSelectedSize(hasSizes ? undefined : '');
    }
  }, [product]);

  const currentImages = useMemo(() => {
    if (product?.variants && selectedVariantIndex !== null && selectedVariantIndex >= 0 && product.variants[selectedVariantIndex]) {
      return product.variants[selectedVariantIndex].imageUrls;
    }
    return product?.imageUrls || [];
  }, [product, selectedVariantIndex]);

  const currentImageHints = useMemo(() => {
    if (product?.variants && selectedVariantIndex !== null && selectedVariantIndex >= 0 && product.variants[selectedVariantIndex]) {
      return product.variants[selectedVariantIndex].imageHints;
    }
    return product?.imageHints || [];
  }, [product, selectedVariantIndex]);

  useEffect(() => {
    if (selectedImageIndex >= currentImages.length) {
      setSelectedImageIndex(0);
    }
  }, [currentImages, selectedImageIndex]);


  if (!product) {
    return null;
  }

  const { id: productId, name, description, price, rating, sizes, originalPrice, isDeal, dealEndDate, category, material, countryOfOrigin, features, variants, reviewSummary, shippingAndService, cardMessageIsEnabled, cardMessageText, cardMessageTextColor, cardMessageFontWeight } = product;
  const selectedImageUrl = currentImages[selectedImageIndex] || '';
  const selectedImageHint = currentImageHints[selectedImageIndex] || '';
  
  const hasSizes = sizes && sizes.length > 0;
  const hasVariants = variants && variants.length > 0;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const selectedColorName = hasVariants && selectedVariantIndex !== null && selectedVariantIndex >= 0 ? variants[selectedVariantIndex].color : undefined;
  
  const isSelectionComplete = (!hasSizes || selectedSize !== undefined) && (!hasVariants || selectedVariantIndex !== null);

  const optionsNotSelectedMessage = [
      hasVariants && selectedVariantIndex === null ? 'اللون' : '',
      hasSizes && !selectedSize ? 'المقاس' : ''
  ].filter(Boolean).join(' و');

  const MainContent = () => (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 items-start", isSheet && "p-4 sm:p-6")}>
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

            {shippingAndService && (
                <div className="pt-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 border-t pt-4">
                        {shippingAndService.cashOnDelivery && <ServiceFeature icon={HandCoins} text="الدفع عند الاستلام" />}
                        {shippingAndService.isReturnable && <ServiceFeature icon={RotateCw} text={`${shippingAndService.returnPeriod || ''} يوم للإرجاع`} />}
                        {shippingAndService.freeDelivery && <ServiceFeature icon={Truck} text="توصيل مجاني" />}
                        {shippingAndService.isFulfilledByDoma && <ServiceFeature icon={Tag} text="شحن بواسطة" subtext="دوما" />}
                        {shippingAndService.isSecureTransaction && <ServiceFeature icon={ShieldCheck} text="معاملة آمنة" />}
                    </div>
                </div>
            )}
        </div>

        <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
            <div className="flex gap-4 items-center text-xs sm:text-sm text-muted-foreground">
                <Link href={`/category/${encodeURIComponent(category)}`} className="hover:text-primary hover:underline flex items-center gap-1">
                    <Tag className="w-4 h-4" /> {category}
                </Link>
            </div>
            <SheetHeader>
                <SheetTitle className="text-xl sm:text-2xl font-headline font-bold text-right">{name}</SheetTitle>
            </SheetHeader>
            <div className="flex items-center gap-2">
                <StarRating rating={rating} />
                <span className="text-xs sm:text-sm text-muted-foreground">({rating.toFixed(1)})</span>
                <a href="#reviews" className="text-xs sm:text-sm text-muted-foreground hover:underline">({reviewSummary?.totalReviews || 0} تقييمات)</a>
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-semibold text-destructive">
                {price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
            </p>
            {hasDiscount && (
                <p className="text-lg sm:text-xl text-muted-foreground line-through">
                    {originalPrice?.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                </p>
            )}
        </div>
        <Separator />

        {cardMessageIsEnabled && cardMessageText && (
          <p className={cn("text-base text-center my-2", cardMessageTextColor, cardMessageFontWeight)}>
              {cardMessageText}
          </p>
        )}

        <SheetDescription className="text-muted-foreground leading-relaxed text-right text-sm">{description}</SheetDescription>
        
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
                    <span className="text-sm text-muted-foreground">{selectedColorName || 'يرجى التحديد'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {variants.map((variant, index) => (
                        <button
                            key={variant.color}
                            onClick={() => setSelectedVariantIndex(index)}
                            className={cn(
                                'flex flex-col items-center gap-2 p-1 rounded-md border-2 transition-all',
                                selectedVariantIndex === index ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-primary/50'
                            )}
                            aria-label={`Select color ${variant.color}`}
                        >
                            <Image
                                src={variant.imageUrls[0]}
                                alt={variant.color}
                                width={60}
                                height={80}
                                className="w-16 h-20 object-cover rounded-md"
                                data-ai-hint={variant.imageHints[0]}
                            />
                            <span className="text-xs text-muted-foreground">{variant.color}</span>
                        </button>
                    ))}
                </div>
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
            <AddToCartButton product={product} selectedSize={selectedSize} selectedColor={selectedColorName} isSelectionComplete={isSelectionComplete} />
             {!isSelectionComplete && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <Info className="h-4 w-4" />
                    <span>الرجاء اختيار {optionsNotSelectedMessage} للمتابعة.</span>
                </div>
            )}
            {isDeal && dealEndDate && <CountdownTimer endDate={dealEndDate} />}
        </div>

        </div>
    </div>
  );

  return (
    <>
        <MainContent />
        <div className={cn('pt-0', isSheet && 'p-4 sm:p-6')}>
            <Separator />
        </div>
        <div className={cn('pt-0', isSheet && 'p-4 sm:p-6')} id="reviews">
            <Reviews productId={productId} />
        </div>
        <div className={cn('pt-0', isSheet && 'p-4 sm:p-6')}>
            <Separator />
        </div>
        <div className={cn('pt-0', isSheet && 'p-4 sm:p-6')}>
            {firestore && <ProductRecommendations currentProduct={product} />}
        </div>
    </>
  );
}
