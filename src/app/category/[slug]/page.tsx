import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import { firestore } from '@/firebase/server';

interface PageProps {
  params: { slug: string };
}

async function getProductsByCategory(categoryName: string): Promise<Product[] | null> {
    try {
        const productsRef = firestore.collection('products');
        const snapshot = await productsRef.where('category', '==', categoryName).get();
        
        if (snapshot.empty) {
            return [];
        }

        const products: Product[] = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        return products;
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return null;
    }
}

export default async function CategoryPage({ params }: PageProps) {
  const categoryName = decodeURIComponent(params.slug);
  const products = await getProductsByCategory(categoryName);
  
  if (products === null) {
    return <div className="text-center py-20">حدث خطأ أثناء جلب المنتجات.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        {categoryName}
      </h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            لا توجد منتجات متاحة في هذه الفئة حاليًا.
          </p>
        </div>
      )}
    </div>
  );
}
