'use client';

import { useEffect, use, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Brand, Category, Product } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const productSchema = z.object({
  name: z.string().min(3, 'اسم المنتج مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب'),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقمًا موجبًا'),
  category: z.string().min(2, 'الفئة مطلوبة'),
  brand: z.string().min(1, 'العلامة التجارية مطلوبة'),
  images: z.array(z.object({
    url: z.string().url('رابط الصورة غير صالح'),
    hint: z.string().min(2, 'تلميح الصورة مطلوب (كلمتين كحد أقصى)'),
  })).min(1, 'يجب إضافة صورة واحدة على الأقل'),
  sizes: z.array(z.object({
    value: z.string().min(1, 'المقاس مطلوب'),
  })).optional(),
});

export default function EditProductPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const productRef = useMemoFirebase(() => (firestore ? doc(firestore, 'products', id) : null), [firestore, id]);
  const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);

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
      images: [{ url: '', hint: '' }],
      sizes: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        images: product.imageUrls.map((url, i) => ({ url, hint: product.imageHints[i] || '' })),
        sizes: product.sizes?.map(value => ({ value })) || [],
      });
    }
  }, [product, form]);

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes"
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!firestore) return;

    const productData = {
      ...values,
      imageUrls: values.images.map(img => img.url),
      imageHints: values.images.map(img => img.hint),
      sizes: values.sizes?.map(s => s.value).filter(s => s.trim() !== ''),
      rating: product?.rating || 0, // Preserve existing rating
    };
    // @ts-ignore
    delete productData.images;

    try {
      const productDocRef = doc(firestore, 'products', id);
      await updateDoc(productDocRef, productData);
      toast({
        title: 'تم تحديث المنتج بنجاح!',
        description: `تم تحديث "${values.name}".`,
      });
      router.push('/dashboard/manage-products');
    } catch (error) {
      console.error("Error updating product: ", error);
      toast({
        variant: 'destructive',
        title: `حدث خطأ أثناء تحديث المنتج`,
        description: 'يرجى المحاولة مرة أخرى.',
      });
    }
  }

  if (isLoadingProduct) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                   <Skeleton className="h-8 w-1/2" />
                   <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>تعديل المنتج</CardTitle>
          <CardDescription>
            قم بتحديث تفاصيل المنتج أدناه.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="name" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>اسم المنتج</FormLabel> <FormControl> <Input placeholder="مثال: ساعة أنيقة" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField name="description" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>وصف المنتج</FormLabel> <FormControl> <Textarea placeholder="صف المنتج بالتفصيل..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField name="price" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>السعر (درهم)</FormLabel> <FormControl> <Input type="number" step="0.01" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
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
                  name="brand"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العلامة التجارية</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingBrands}>
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
              <Separator />
              <div>
                <FormLabel>صور المنتج</FormLabel>
                <div className="space-y-4 pt-2">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end p-4 border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                          <FormField name={`images.${index}.url`} control={form.control} render={({ field }) => ( <FormItem> <FormLabel>رابط الصورة</FormLabel> <FormControl> <Input placeholder="https://example.com/image.jpg" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                          <FormField name={`images.${index}.hint`} control={form.control} render={({ field }) => ( <FormItem> <FormLabel>تلميح الصورة (AI)</FormLabel> <FormControl> <Input placeholder="مثال: elegant watch" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)} disabled={imageFields.length <= 1}> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendImage({ url: '', hint: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> إضافة صورة أخرى </Button>
                <FormMessage>{form.formState.errors.images?.root?.message}</FormMessage>
              </div>
              <Separator />
              <div>
                <FormLabel>المقاسات (اختياري)</FormLabel>
                 <div className="space-y-4 pt-2">
                  {sizeFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-center">
                      <FormField name={`sizes.${index}.value`} control={form.control} render={({ field }) => ( <FormItem className="flex-grow"> <FormControl> <Input placeholder="مثال: S, M, L, 42" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(index)}> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                  ))}
                 </div>
                 <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSize({ value: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> إضافة مقاس </Button>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
