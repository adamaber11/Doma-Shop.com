import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import { firestore } from '@/firebase/server';

interface PageProps {
  params: { slug: string };
}

async function getProductsByBrand(brandName: string): Promise<Product[] | null> {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('brand', '==', brandName).get();
    
    if (snapshot.empty) {
      return [];
    }

    const products: Product[] = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    return null;
  }
}

export default async function BrandPage({ params }: PageProps) {
  const brandName = decodeURIComponent(params.slug);
  const products = await getProductsByBrand(brandName);

  if (products === null) {
    // This could be a 500 error page in a real app
    return <div className="text-center py-20">حدث خطأ أثناء جلب المنتجات.</div>;
  }
  
  // Unlike client components, we can't determine "loading" state here.
  // If we want a notFound for a brand that exists but has no products, this is correct.
  // If we want a "not found" for a brand that doesn't exist at all, a separate query would be needed.
  // For simplicity, we assume an empty array means the brand is valid but has no items to show.

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">
        منتجات {brandName}
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
            لا توجد منتجات متاحة لهذه العلامة التجارية حاليًا.
          </p>
        </div>
      )}
    </div>
  );
}
