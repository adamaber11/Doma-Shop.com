
import { MetadataRoute } from 'next';
 
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doma-shop.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/cart/', '/checkout/', '/orders/', '/profile/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
