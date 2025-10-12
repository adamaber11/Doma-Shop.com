'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, Minus, Plus, ShoppingCart, Info } from 'lucide-react';

interface AddToCartButtonProps {
    product: Product;
    selectedSize?: string;
    selectedColor?: string;
}

export default function AddToCartButton({ product, selectedSize, selectedColor }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isItemInCart } = useCart();
  const { toast } = useToast();
  
  const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
  const itemInCart = isItemInCart(cartItemId);
  
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const isAddToCartDisabled = product.stock === 0 || itemInCart;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={isAddToCartDisabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-16 h-10 text-center"
          min="1"
          max={product.stock}
          disabled={isAddToCartDisabled}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
          disabled={isAddToCartDisabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        size="lg"
        className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled}
      >
        {itemInCart ? (
          <>
            <Info className="mr-2 h-5 w-5" />
            المنتج في السلة
          </>
        ) : product.stock === 0 ? (
          'غير متوفر'
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

    