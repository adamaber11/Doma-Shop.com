
import ProductCard from '@/components/ProductCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server';
import type { Product } from '@/lib/types';
import { CalendarClock } from 'lucide-react';

async function getDailyDeals() {
    if (!firestore) {
        return [];
    }
    try {
        const productsRef = collection(firestore, 'products');
        const q = query(productsRef, where('isDeal', '==', true));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return products;
    } catch (error) {
        console.error("Error fetching daily deals:", error);
        return [];
    }
}

export default async function DailyDealsPage() {
  const products = await getDailyDeals();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        العروض اليومية
      </h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <CalendarClock className="mx-auto h-24 w-24 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            لا توجد عروض يومية متاحة في الوقت الحالي.
          </p>
           <p className="mt-2 text-sm text-muted-foreground">
            استعدوا لعروض يومية لا تقاوم على أفضل المنتجات قريبًا!
          </p>
        </div>
      )}
    </div>
  );
}
