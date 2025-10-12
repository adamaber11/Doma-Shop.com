
import { MetadataRoute } from 'next';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/client-provider'; // Adjust path if needed
import type { Product, Category, Brand } from '@/lib/types';

// Initialize Firebase Admin to fetch data on the server
let firestore: any;
try {
    const { firestore: fs } = initializeFirebase();
    firestore = fs;
} catch (e) {
    console.error("Firebase initialization failed for sitemap:", e);
}


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
      console.warn("Firestore not initialized, returning only static routes for sitemap.");
      return staticRoutes;
  }

  try {
    // Dynamic product routes
    const productsSnapshot = await getDocs(collection(firestore, 'products'));
    const productRoutes = productsSnapshot.docs.map((doc) => {
        const product = doc.data() as Product;
        return {
        url: `${APP_URL}/products/${doc.id}`,
        lastModified,
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.7,
        };
    });

    // Dynamic category routes
    const categoriesSnapshot = await getDocs(collection(firestore, 'categories'));
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
    const brandsSnapshot = await getDocs(collection(firestore, 'brands'));
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
