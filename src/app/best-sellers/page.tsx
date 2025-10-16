
import ProductCard from '@/components/ProductCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/server';
import type { Product } from '@/lib/types';
import { Star } from 'lucide-react';

async function getBestSellers() {
    if (!firestore) {
        return [];
    }
    try {
        const productsRef = collection(firestore, 'products');
        const q = query(productsRef, where('isBestSeller', '==', true));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        return products;
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        return [];
    }
}

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        الأكثر مبيعًا
      </h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Star className="mx-auto h-24 w-24 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            لا توجد منتجات ضمن الأكثر مبيعًا حاليًا.
          </p>
           <p className="mt-2 text-sm text-muted-foreground">
            قم بإضافة منتجات مميزة من لوحة التحكم لتظهر هنا.
          </p>
        </div>
      )}
    </div>
  );
}
