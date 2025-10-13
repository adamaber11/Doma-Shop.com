
import { MetadataRoute } from 'next';
import { firestore } from '@/firebase/server'; // Corrected import
import type { Product, Category, Brand } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doma-shop.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/best-sellers',
    '/cart',
    '/checkout',
    '/contact',
    '/daily-deals',
    '/login',
    '/offers',
    '/orders',
    '/privacy',
    '/products',
    '/profile',
    '/returns',
    '/signup',
    '/terms',
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified,
    changeFrequency: 'weekly' as 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic product routes
    const productsSnapshot = await firestore.collection('products').get();
    const productRoutes = productsSnapshot.docs.map((doc) => {
        return {
        url: `${APP_URL}/products/${doc.id}`,
        lastModified,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
        };
    });

    // Dynamic category routes
    const categoriesSnapshot = await firestore.collection('categories').get();
    const categoryRoutes = categoriesSnapshot.docs.map((doc) => {
        const category = doc.data() as Category;
        return {
        url: `${APP_URL}/category/${encodeURIComponent(category.name)}`,
        lastModified,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.6,
        };
    });

    // Dynamic brand routes
    const brandsSnapshot = await firestore.collection('brands').get();
    const brandRoutes = brandsSnapshot.docs.map((doc) => {
        const brand = doc.data() as Brand;
        return {
        url: `${APP_URL}/brand/${encodeURIComponent(brand.name)}`,
        lastModified,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.6,
        };
    });

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];

  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    return staticRoutes; // Fallback to static routes on error
  }
}
