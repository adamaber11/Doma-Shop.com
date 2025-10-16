
import { notFound } from 'next/navigation';
import { firestore } from '@/firebase/server';
import type { Product } from '@/lib/types';
import ProductQuickViewContent from '@/components/ProductQuickViewContent';
import { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';


interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string): Promise<Product | null> {
    try {
        const docRef = firestore.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        return { id: doc.id, ...doc.data() } as Product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: `المنتج غير موجود | ${APP_NAME}`,
    };
  }
  
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doma-shop.com';

  return {
    title: `${product.name} | ${APP_NAME}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ${APP_NAME}`,
      description: product.description,
      images: [
        {
          url: product.imageUrls[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      url: `${APP_URL}/products/${product.id}`,
    },
  };
}


export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductQuickViewContent product={product} />
    </div>
  );
}
