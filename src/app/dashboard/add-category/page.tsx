'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';

const categorySchema = z.object({
  name: z.string().min(2, 'اسم الفئة مطلوب'),
  parentId: z.string().optional(),
});

export default function AddCategoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: '',
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
      await addDoc(collection(firestore, 'categories'), {
        name: values.name,
        parentId: values.parentId || null, // Store null if no parent is selected
      });

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
            املأ النموذج أدناه لإضافة فئة جديدة. اختر فئة رئيسية لجعلها فئة فرعية.
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
                      <Input placeholder="مثال: هواتف ذكية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة الرئيسية (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فئة رئيسية..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">-- لا يوجد --</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
