
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAIL = 'adamaber50@gmail.com';

function DashboardNav() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/dashboard', label: 'نظرة عامة' },
    { href: '/dashboard/orders', label: 'طلبات العملاء' },
    { href: '/dashboard/messages', label: 'رسائل العملاء' },
    { href: '/dashboard/manage-products', label: 'إدارة المنتجات' },
    { href: '/dashboard/manage-categories', label: 'إدارة الفئات' },
    { href: '/dashboard/manage-shipping', label: 'إدارة الشحن' },
    { href: '/dashboard/manage-hero', label: 'إدارة الواجهة' },
    { href: '/dashboard/manage-socials', label: 'إدارة التواصل الاجتماعي' },
    { href: '/dashboard/manage-popup', label: 'إدارة الإعلان المنبثق' },
  ];

  return (
    <nav className="bg-card border-b sticky top-[80px] z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto pb-px">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                pathname.startsWith(link.href) && (pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href)))
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

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished, check the user's status
    if (!isUserLoading) {
      // If no user is logged in OR the logged-in user is not the admin, redirect
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  // While loading, or if the user is not the admin (before redirect kicks in),
  // show a skeleton screen or nothing to prevent content flashing.
  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <DashboardNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
