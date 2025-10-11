'use client';

import Link from 'next/link';
import CartSheet from './CartSheet';

export default function Navbar() {
    const navLinks = [
        { href: '/', label: 'الرئيسية' },
        { href: '/offers', label: 'العروض' },
        { href: '/shopping', label: 'التسوق' },
        { href: '/best-sellers', label: 'الاكثر مبيعا' },
        { href: '/daily-deals', label: 'العروض اليوميه' },
        { href: '/coupons', label: 'كوبونات الخصم' },
      ];

  return (
    <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="hidden md:flex justify-start gap-8">
              {navLinks.map((link) => (
                  <Link
                  key={link.label}
                  href={link.href}
                  className="nav-link-underline text-sm font-medium text-muted-foreground py-4"
                  >
                  {link.label}
                  </Link>
              ))}
              </div>
              <CartSheet />
            </div>
        </div>
    </nav>
  );
}
