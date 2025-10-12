'use client';

import type { Product } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';

export interface QuickViewContextType {
  isQuickViewOpen: boolean;
  product: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

export const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export const QuickViewProvider = ({ children }: { children: ReactNode }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((product: Product) => {
    setProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    // Optional: delay clearing the product to allow for exit animation
    setTimeout(() => {
        setProduct(null);
    }, 300);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{
        isQuickViewOpen,
        product,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}
