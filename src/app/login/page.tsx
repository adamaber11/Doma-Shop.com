'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'أهلاً بعودتك!',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error.message || 'فشل تسجيل الدخول. يرجى التحقق من معلوماتك.',
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="email">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel htmlFor="password">كلمة المرور</FormLabel>
                      <Link href="#" className="ms-auto inline-block text-sm underline">
                        هل نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ليس لديك حساب؟ <Link href="/signup" className="underline">إنشاء حساب</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}