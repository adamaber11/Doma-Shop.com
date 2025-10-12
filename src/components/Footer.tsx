
'use client';

import Link from 'next/link';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Instagram } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { SocialLinks } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 hover:text-primary"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 hover:text-primary"
    >
      <path d="M12 12a4 4 0 1 0 4 4V8a8 8 0 1 1-8-8" />
    </svg>
  );

export default function Footer() {
  const firestore = useFirestore();
  const socialLinksRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'socialLinks') : null),
    [firestore]
  );
  const { data: socialLinks, isLoading } = useDoc<SocialLinks>(socialLinksRef);


  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              تجربة تسوق فاخرة للمتسوق المميز.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              {isLoading ? (
                 <div className="flex space-x-4 space-x-reverse">
                    <Skeleton className='h-5 w-5 rounded-full' />
                    <Skeleton className='h-5 w-5 rounded-full' />
                    <Skeleton className='h-5 w-5 rounded-full' />
                 </div>
              ) : (
                <>
                 {socialLinks?.facebook && <Link href={socialLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FacebookIcon /></Link>}
                 {socialLinks?.instagram && <Link href={socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 hover:text-primary" /></Link>}
                 {socialLinks?.tiktok && <Link href={socialLinks.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer"><TiktokIcon /></Link>}
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">الرئيسية</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">جميع المنتجات</Link></li>
              <li><Link href="/orders" className="text-muted-foreground hover:text-primary">طلباتي</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">تواصل معنا</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">قانوني</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">شروط الخدمة</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-primary">سياسة الاسترجاع</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">اشترك في نشرتنا البريدية</h3>
            <p className="text-sm text-muted-foreground mb-2">احصل على آخر التحديثات والعروض الخاصة.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="بريدك الإلكتروني" className="flex-grow" />
              <Button type="submit" variant="secondary">اشترك</Button>
            </form>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
