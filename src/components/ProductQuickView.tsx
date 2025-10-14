
'use client';

import { useQuickView } from '@/hooks/use-quick-view';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import ProductQuickViewContent from './ProductQuickViewContent';
import { ScrollArea } from './ui/scroll-area';


export default function ProductQuickView() {
  const { isQuickViewOpen, closeQuickView, product } = useQuickView();

  if (!product) {
    return null;
  }

  return (
    <Sheet open={isQuickViewOpen} onOpenChange={closeQuickView}>
      <SheetContent side="left" className="w-full sm:max-w-4xl p-0">
        <ScrollArea className="h-full">
            <ProductQuickViewContent product={product} isSheet={true} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
