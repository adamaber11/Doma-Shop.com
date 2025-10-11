'use client';

import Link from 'next/link';

export default function Navbar() {
    const navLinks = [
        { href: '/', label: 'الرئيسية' },
        { href: '/collections', label: 'المجموعات' },
        { href: '/offers', label: 'العروض' },
        { href: '/contact', label: 'تواصل معنا' },
      ];

  return (
    <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
            <div className="hidden md:flex justify-end gap-8">
            {navLinks.map((link) => (
                <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary py-4"
                >
                {link.label}
                </Link>
            ))}
            </div>
        </div>
    </nav>
  );
}
