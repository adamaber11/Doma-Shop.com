
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
import { Menu, ChevronLeft, ArrowLeft, type LucideIcon, type LucideProps, ForwardRefExoticComponent, RefAttributes } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import type { Category as CategoryType } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useMemo } from 'react';
import { ScrollArea } from './ui/scroll-area';

type CategoryWithSubcategories = CategoryType & {
  subcategories: CategoryWithSubcategories[];
};

// A type guard to check if a string is a valid Lucide icon name
const isLucideIcon = (name: string): name is keyof typeof Icons => {
  return name in Icons;
};

// A fallback icon component
const DefaultIcon = Icons.LayoutGrid;

export default function CategoriesSheet() {
  const firestore = useFirestore();
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading } = useCollection<CategoryType>(categoriesQuery);

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    
    const categoryMap = new Map<string, CategoryWithSubcategories>();
    const rootCategories: CategoryWithSubcategories[] = [];

    // Initialize map with all categories
    categories.forEach(category => {
        categoryMap.set(category.id, { ...category, subcategories: [] });
    });

    // Build the tree structure
    categories.forEach(category => {
        if (category.parentId) {
            const parent = categoryMap.get(category.parentId);
            const child = categoryMap.get(category.id);
            if (parent && child) {
                parent.subcategories.push(child);
            }
        } else {
            const rootCategory = categoryMap.get(category.id);
            if (rootCategory) {
                rootCategories.push(rootCategory);
            }
        }
    });

    return rootCategories;
  }, [categories]);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/offers', label: 'العروض' },
    { href: '/shopping', label: 'التسوق' },
    { href: '/best-sellers', label: 'الاكثر مبيعا' },
    { href: '/daily-deals', label: 'العروض اليوميه' },
  ];

  const renderCategory = (category: CategoryWithSubcategories) => {
    const IconComponent: ForwardRefExoticComponent<Omit<LucideIcon, "ref"> & RefAttributes<LucideIcon>> = category.iconName && isLucideIcon(category.iconName)
      ? Icons[category.iconName]
      : DefaultIcon;
      
    if (category.subcategories.length === 0) {
      return (
        <SheetClose asChild key={category.id}>
          <Link
            href="/products"
            className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <IconComponent className="h-5 w-5" />
            <span className="font-medium">{category.name}</span>
          </Link>
        </SheetClose>
      );
    }

    return (
      <Accordion type="single" collapsible key={category.id} className="w-full">
        <AccordionItem value={category.id} className="border-none">
          <AccordionTrigger className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors hover:no-underline">
              <div className="flex items-center gap-3">
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{category.name}</span>
              </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 pr-6">
            <div className="flex flex-col space-y-1 mt-1">
              <SheetClose asChild>
                <Link
                  href="/products"
                  className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">عرض الكل في {category.name}</span>
                </Link>
              </SheetClose>
              {category.subcategories.map(renderCategory)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

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
        <ScrollArea className="flex-grow my-4">
          {isLoading ? (
            <div className="space-y-4">
                {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : categoryTree.length > 0 ? (
            <div className="space-y-1">
              {categoryTree.map(renderCategory)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center pt-10">
              لا توجد فئات متاحة حاليًا.
            </p>
          )}

          <Separator className="my-6" />

           <div className="space-y-2 md:hidden">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </SheetClose>
              ))}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
