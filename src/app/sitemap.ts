
import { MetadataRoute } from 'next';
import { firestore } from '@/firebase/server';
import type { Product, Category } from '@/lib/types';

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

  if (!firestore) {
    console.warn("Sitemap: Firestore not available, returning only static routes.");
    return staticRoutes;
  }

  try {
    // Dynamic routes from Firestore
    const productsSnapshot = await firestore.collection('products').get();
    const productRoutes = productsSnapshot.docs.map((doc) => {
        return {
        url: `${APP_URL}/products/${doc.id}`,
        lastModified,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
        };
    });

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

    // Combine all routes
    return [...staticRoutes, ...productRoutes, ...categoryRoutes];

  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // On error, return only static routes to prevent build failure
    return staticRoutes;
  }
}
