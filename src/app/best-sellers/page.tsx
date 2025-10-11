import { Star } from 'lucide-react';

export default function BestSellersPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Star className="mx-auto h-24 w-24 text-yellow-400 fill-yellow-400" />
        <h1 className="mt-8 text-4xl font-headline font-bold">الأكثر مبيعًا</h1>
        <p className="mt-4 text-xl text-muted-foreground">
            قائمة المنتجات الأكثر شعبية قادمة قريبًا!
        </p>
        <p className="mt-2 text-muted-foreground">
            نحن نجمع البيانات لنعرض لكم المنتجات التي يحبها الجميع.
        </p>
    </div>
  );
}
