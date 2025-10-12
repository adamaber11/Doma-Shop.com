'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
    product: Product;
    selectedSize?: string;
    selectedColor?: string;
}

export default function AddToCartButton({ product, selectedSize, selectedColor }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى اختيار مقاس قبل إضافة المنتج إلى السلة.",
        });
        return;
    }
    if (product.variants && product.variants.length > 0 && !selectedColor) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى اختيار لون قبل إضافة المنتج إلى السلة.",
        });
        return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isAddToCartDisabled = (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                              (product.variants && product.variants.length > 0 && !selectedColor);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-16 h-10 text-center"
          min="1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        size="lg"
        className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleAddToCart}
        disabled={!!isAddToCartDisabled}
      >
        {added ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            تمت الإضافة
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            أضف إلى السلة
          </>
        )}
      </Button>
    </div>
  );
}
