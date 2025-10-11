import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, User, LogIn, UserPlus, Package } from 'lucide-react';
import Logo from './Logo';
import CartSheet from './CartSheet';

export default function Header() {
  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '#', label: 'المجموعات' },
    { href: '#', label: 'العروض' },
    { href: '#', label: 'تواصل معنا' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="pl-9" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> تسجيل الدخول</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> إنشاء حساب</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders"><Package className="mr-2 h-4 w-4" /> طلباتي</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CartSheet />
        </div>
      </div>
    </header>
  );
}
