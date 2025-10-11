'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

function DashboardNav() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/dashboard', label: 'نظرة عامة' },
    { href: '/dashboard/orders', label: 'طلبات العملاء' },
    { href: '/dashboard/manage-products', label: 'إدارة المنتجات' },
    { href: '/dashboard/manage-categories', label: 'إدارة الفئات' },
    { href: '/dashboard/manage-brands', label: 'إدارة العلامات التجارية' },
  ];

  return (
    <nav className="bg-card border-b sticky top-[80px] z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto pb-px">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                pathname.startsWith(link.href) && (pathname === link.href || link.href !== '/dashboard')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <DashboardNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
