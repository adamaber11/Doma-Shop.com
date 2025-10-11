'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

const categorySchema = z.object({
  name: z.string().min(2, 'اسم الفئة مطلوب'),
});

export default function AddCategoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'خدمة قاعدة البيانات غير متاحة.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'categories'), values);

      toast({
        title: 'تمت إضافة الفئة بنجاح!',
        description: `تمت إضافة فئة "${values.name}".`,
      });
      form.reset();
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ أثناء إضافة الفئة',
        description: 'يرجى المحاولة مرة أخرى.',
      });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>إضافة فئة جديدة</CardTitle>
          <CardDescription>
            املأ النموذج أدناه لإضافة فئة جديدة إلى المتجر.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفئة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: إلكترونيات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري الإضافة...' : 'إضافة الفئة'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
