'use client';

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
import { Search, User, LogIn, UserPlus, Package, LogOut } from 'lucide-react';
import Logo from './Logo';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback } from './ui/avatar';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
        </div>

        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="pl-9" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {isUserLoading ? (
                  <User className="h-6 w-6 animate-pulse" />
                ) : user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-6 w-6" />
                )}
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> ملفي الشخصي</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders"><Package className="mr-2 h-4 w-4" /> طلباتي</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> تسجيل الدخول</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> إنشاء حساب</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
