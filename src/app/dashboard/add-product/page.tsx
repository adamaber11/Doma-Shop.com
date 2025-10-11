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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Brand, Category } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(3, 'اسم المنتج مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب'),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقمًا موجبًا'),
  category: z.string().min(2, 'الفئة مطلوبة'),
  brand: z.string().min(1, 'العلامة التجارية مطلوبة'),
  imageUrl: z.string().url('رابط الصورة غير صالح'),
  imageHint: z.string().min(2, 'تلميح الصورة مطلوب (كلمتين كحد أقصى)'),
  rating: z.coerce.number().min(0).max(5, 'التقييم يجب أن يكون بين 0 و 5'),
});

export default function AddProductPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const brandsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'brands') : null), [firestore]);
  const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      imageUrl: '',
      imageHint: '',
      rating: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'خدمة قاعدة البيانات غير متاحة.',
      });
      return;
    }

    try {
      await addDoc(collection(firestore, 'products'), values);

      toast({
        title: 'تمت إضافة المنتج بنجاح!',
        description: `تمت إضافة "${values.name}" إلى المتجر.`,
      });
      form.reset();
    } catch (error) {
      console.error("Error adding product: ", error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ أثناء إضافة المنتج',
        description: 'يرجى المحاولة مرة أخرى.',
      });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>إضافة منتج جديد</CardTitle>
          <CardDescription>
            املأ النموذج أدناه لإضافة منتج جديد إلى متجرك.
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
                    <FormLabel>اسم المنتج</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: ساعة أنيقة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المنتج</FormLabel>
                    <FormControl>
                      <Textarea placeholder="صف المنتج بالتفصيل..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر (درهم)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فئة..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العلامة التجارية</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingBrands}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر علامة..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>رابط الصورة</FormLabel>
                        <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="imageHint"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>تلميح الصورة (AI)</FormLabel>
                        <FormControl>
                        <Input placeholder="مثال: elegant watch" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التقييم (0-5)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري الإضافة...' : 'إضافة المنتج'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
