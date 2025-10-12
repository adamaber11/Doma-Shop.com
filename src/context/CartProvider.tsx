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

  const addToCart = useCallback((product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    setCartItems(prevItems => {
      // Cart item ID is now a combination of product ID, size, and color
      const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
      const existingItem = prevItems.find(i => i.id === cartItemId);
      
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(i =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        const newItem: CartItem = { 
            ...product, 
            quantity, 
            selectedSize,
            selectedColor,
            id: cartItemId, // The unique ID for the cart item
            productId: product.id, // The original product ID
        };
        newItems = [...prevItems, newItem];
      }
      toast({
        title: 'تمت الإضافة إلى السلة',
        description: `${quantity} x ${product.name} ${selectedSize ? `(المقاس: ${selectedSize})` : ''} ${selectedColor ? `(اللون: ${selectedColor})` : ''}`,
      });
      return newItems;
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
        prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!isClient) {
    // Return null or a loading state until the client has mounted
    // This prevents hydration mismatches with localStorage
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
        cartCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
