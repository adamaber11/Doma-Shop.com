import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { APP_NAME } from '@/lib/constants';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'An elegant e-commerce experience for the discerning shopper.',
};

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
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
