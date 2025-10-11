'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    if (!auth) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'خدمة المصادقة غير متاحة.' });
        return;
    }
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: 'تم إرسال رابط إعادة التعيين',
        description: 'يرجى التحقق من بريدك الإلكتروني للمتابعة.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error.message || 'فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.',
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl font-headline">هل نسيت كلمة المرور؟</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.</CardDescription>
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            تذكرت كلمة المرور؟ <Link href="/login" className="underline">تسجيل الدخول</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
