'use client';

import type { CartItem, Product } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: string) => boolean;
  cartCount: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedCart = localStorage.getItem('tajer-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Could not parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('tajer-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isClient]);

  const isItemInCart = useCallback((id: string) => {
    return cartItems.some(item => item.id === id);
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    setCartItems(prevItems => {
      const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
      const existingItem = prevItems.find(i => i.id === cartItemId);

      if (existingItem) {
        toast({
          variant: 'destructive',
          title: 'المنتج موجود بالفعل',
          description: 'هذا المنتج موجود بالفعل في سلة التسوق الخاصة بك.',
        });
        return prevItems;
      }
      
      if (quantity > product.stock) {
        toast({
            variant: 'destructive',
            title: 'الكمية غير متوفرة',
            description: `الكمية المتاحة لهذا المنتج هي ${product.stock} فقط.`,
        });
        return prevItems;
      }

      const newItem: CartItem = { 
          ...product, 
          quantity, 
          selectedSize,
          selectedColor,
          id: cartItemId,
          productId: product.id,
      };
      
      toast({
        title: 'تمت الإضافة إلى السلة',
        description: `${quantity} x ${product.name} ${selectedSize ? `(المقاس: ${selectedSize})` : ''} ${selectedColor ? `(اللون: ${selectedColor})` : ''}`,
      });

      return [...prevItems, newItem];
    });
  }, [toast]);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    if (quantity > item.stock) {
                        toast({
                            variant: 'destructive',
                            title: 'الكمية غير متوفرة',
                            description: `الكمية القصوى المتاحة هي ${item.stock}.`,
                        });
                        return { ...item, quantity: item.stock };
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    }
  }, [removeFromCart, toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!isClient) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isItemInCart,
        cartCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

    