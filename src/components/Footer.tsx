import Link from 'next/link';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Github, Twitter, Instagram } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
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
              <Link href="/twitter" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></Link>
              <Link href="/instagram" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></Link>
              <Link href="/github" aria-label="Github"><Github className="h-5 w-5 hover:text-primary" /></Link>
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
