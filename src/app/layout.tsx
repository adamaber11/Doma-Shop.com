
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { APP_NAME } from '@/lib/constants';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Navbar from '@/components/Navbar';
import { QuickViewProvider } from '@/context/QuickViewProvider';
import ProductQuickView from '@/components/ProductQuickView';
import PromotionalPopup from '@/components/PromotionalPopup';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doma-shop.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Doma Shop',
  alternateName: 'متجر دوما',
  url: APP_URL,
  logo: `${APP_URL}/logo.png`, // Assuming you have a logo at public/logo.png
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+20-12-345-6789', // Example phone number
    contactType: 'customer service',
    areaServed: 'EG',
    availableLanguage: ['en', 'ar'],
  },
  sameAs: [
    'https://www.facebook.com/domashop', // Replace with your actual social media links
    'https://www.instagram.com/domashop',
    'https://www.tiktok.com/@domashop',
  ],
  description: 'Doma Shop offers an elegant e-commerce experience for the discerning shopper, featuring a wide range of high-quality products. متجر دوما يقدم تجربة تسوق إلكترونية أنيقة للمتسوق المميز، مع مجموعة واسعة من المنتجات عالية الجودة.',
};


export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} | Your Destination for Elegant Shopping`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Discover a wide range of high-quality products at Doma Shop. Elegant e-commerce experience for the discerning shopper. اكتشف مجموعة واسعة من المنتجات عالية الجودة في متجر دوما. تجربة تسوق إلكترونية أنيقة للمتسوق المميز.',
  keywords: [
    'Doma Shop',
    'متجر دوما',
    'online shopping',
    'تسوق اونلاين',
    'e-commerce',
    'تجارة إلكترونية',
    'fashion',
    'أزياء',
    'electronics',
    'إلكترونيات',
    'home goods',
    'منتجات منزلية',
    'Egypt',
    'مصر',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-EG': '/ar',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
    url: APP_URL,
    title: `${APP_NAME} | Elegant Online Shopping`,
    description: 'The best place for high-quality products and a premium shopping experience.',
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png', // Create this image at public/og-image.png (1200x630)
        width: 1200,
        height: 630,
        alt: `Doma Shop Logo and Promotional Banner`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} | Your Premier Online Store`,
    description: 'Shop the latest trends and top-quality products at Doma Shop.',
    images: ['/twitter-image.png'], // Create this image at public/twitter-image.png (e.g., 800x418)
    creator: '@DomaShop', // Replace with your Twitter handle
  },
  icons: {
    icon: '/favicon.ico', // Add favicon.ico to your public folder
    shortcut: '/favicon-16x16.png', // Add favicons to public folder
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <QuickViewProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <Navbar />
                <main className="flex-grow pt-5">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
              <ProductQuickView />
              <PromotionalPopup />
            </QuickViewProvider>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
