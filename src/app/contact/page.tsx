
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const contactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  subject: z.string().min(5, 'الموضوع مطلوب (5 أحرف على الأقل)'),
  message: z.string().min(10, 'الرسالة مطلوبة (10 أحرف على الأقل)'),
});

export default function ContactPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الاتصال',
        description: 'لا يمكن الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        ...values,
        createdAt: serverTimestamp(),
        isRead: false,
      });
      toast({
        title: 'تم إرسال رسالتك بنجاح!',
        description: 'شكرًا لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.',
      });
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ ما',
        description: 'لم نتمكن من إرسال رسالتك. يرجى المحاولة مرة أخرى.',
      });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-headline">تواصل معنا</CardTitle>
          <CardDescription>
            لديك سؤال أو استفسار؟ املأ النموذج أدناه وسنعاود الاتصال بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input placeholder="example@mail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموضوع</FormLabel>
                    <FormControl>
                      <Input placeholder="استفسار بخصوص طلب..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسالتك</FormLabel>
                    <FormControl>
                      <Textarea placeholder="اكتب رسالتك هنا..." rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
