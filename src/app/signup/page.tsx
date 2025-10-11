import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl font-headline">إنشاء حساب</CardTitle>
          <CardDescription>
            أدخل معلوماتك أدناه لإنشاء حساب جديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">الاسم الكامل</Label>
              <Input id="full-name" placeholder="فلان الفلاني" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              إنشاء حساب
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
