'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated after loading
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto mt-4" />
            <Skeleton className="h-5 w-64 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 text-3xl">
            <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
          </Avatar>
          <div className='pt-4'>
            <CardTitle className="text-3xl">{user.displayName || 'مستخدم'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='flex flex-col space-y-2'>
                <p className='text-sm text-muted-foreground'>الاسم الكامل</p>
                <p className='font-medium'>{user.displayName}</p>
            </div>
            <div className='flex flex-col space-y-2'>
                <p className='text-sm text-muted-foreground'>البريد الإلكتروني</p>
                <p className='font-medium'>{user.email}</p>
            </div>
             <Button className="w-full" disabled>تعديل الملف الشخصي (قريبًا)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
