'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutGrid } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';

export default function CategoriesSheet() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const categories = useMemo(() => {
    if (!products) return [];
    const categorySet = new Set(products.map(p => p.category));
    return Array.from(categorySet);
  }, [products]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open categories menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">الفئات</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 my-4">
          {isLoading ? (
            <div className="space-y-4">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <SheetClose asChild key={category}>
                  <Link
                    href={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <LayoutGrid className="h-5 w-5" />
                    <span className="font-medium">{category}</span>
                  </Link>
                </SheetClose>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center pt-10">
              لا توجد فئات متاحة حاليًا.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
