'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, addDoc } from 'firebase/firestore';
import type { Product, Category, Brand } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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

function AddProductDialog({ onProductAdded }: { onProductAdded: () => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);

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

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: form.control, name: "images" });
    const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({ control: form.control, name: "sizes" });

    async function onSubmit(values: z.infer<typeof productSchema>) {
        if (!firestore) return;

        const productData = {
            ...values,
            imageUrls: values.images.map(img => img.url),
            imageHints: values.images.map(img => img.hint),
            sizes: values.sizes?.map(s => s.value).filter(s => s.trim() !== ''),
            rating: 0,
        };
        // @ts-ignore
        delete productData.images;

        try {
            await addDoc(collection(firestore, 'products'), productData);
            toast({
                title: 'تمت إضافة المنتج بنجاح!',
                description: `تمت إضافة "${values.name}" إلى المتجر.`,
            });
            setIsOpen(false);
            onProductAdded();
            form.reset();
        } catch (error) {
            console.error("Error saving product: ", error);
            toast({
                variant: 'destructive',
                title: `حدث خطأ أثناء إضافة المنتج`,
                description: 'يرجى المحاولة مرة أخرى.',
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    إضافة منتج جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>إضافة منتج جديد</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
                        <FormField name="name" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>اسم المنتج</FormLabel> <FormControl> <Input placeholder="مثال: ساعة أنيقة" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField name="description" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>وصف المنتج</FormLabel> <FormControl> <Textarea placeholder="صف المنتج بالتفصيل..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField name="price" control={form.control} render={({ field }) => ( <FormItem> <FormLabel>السعر (درهم)</FormLabel> <FormControl> <Input type="number" step="0.01" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>الفئة</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}> <FormControl> <SelectTrigger> <SelectValue placeholder="اختر فئة..." /> </SelectTrigger> </FormControl> <SelectContent> {categories?.map((cat) => ( <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel>العلامة التجارية</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingBrands}> <FormControl> <SelectTrigger> <SelectValue placeholder="اختر علامة..." /> </SelectTrigger> </FormControl> <SelectContent> {brands?.map((brand) => ( <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        </div>
                        <Separator />
                        <div>
                            <FormLabel>صور المنتج</FormLabel>
                            <div className="space-y-2 pt-2">
                                {imageFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end p-2 border rounded-md">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                                            <FormField name={`images.${index}.url`} control={form.control} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">رابط الصورة</FormLabel> <FormControl> <Input placeholder="https://..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                                            <FormField name={`images.${index}.hint`} control={form.control} render={({ field }) => ( <FormItem> <FormLabel className="text-xs">تلميح (AI)</FormLabel> <FormControl> <Input placeholder="مثال: elegant watch" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)} disabled={imageFields.length <= 1}> <Trash2 className="h-4 w-4" /> </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendImage({ url: '', hint: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> صورة أخرى </Button>
                            <FormMessage>{form.formState.errors.images?.root?.message}</FormMessage>
                        </div>
                        <Separator />
                        <div>
                            <FormLabel>المقاسات (اختياري)</FormLabel>
                            <div className="space-y-2 pt-2">
                                {sizeFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <FormField name={`sizes.${index}.value`} control={form.control} render={({ field }) => ( <FormItem className="flex-grow"> <FormControl> <Input placeholder="مثال: S, M, L, 42" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(index)}> <Trash2 className="h-4 w-4" /> </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSize({ value: '' })}> <PlusCircle className="mr-2 h-4 w-4" /> إضافة مقاس </Button>
                        </div>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'جاري الإضافة...' : 'إضافة المنتج'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function ManageProductsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: isLoadingProducts, forceUpdate } = useCollection<Product>(productsQuery);

  async function handleDelete(productId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productId));
      toast({ title: 'تم حذف المنتج بنجاح' });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحذف' });
    }
  }

  const handleEdit = (productId: string) => {
    router.push(`/dashboard/edit-product/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">إدارة المنتجات</h1>
        <AddProductDialog onProductAdded={forceUpdate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>عرض وتعديل وحذف المنتجات الموجودة في متجرك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">الصورة</TableHead>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead className="w-[120px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-16 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                     <TableCell>
                      <Image 
                        src={product.imageUrls?.[0] || '/placeholder.svg'} 
                        alt={product.name} 
                        width={64} 
                        height={64} 
                        className="object-cover rounded-md bg-muted" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المنتج بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>متابعة</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">لم يتم العثور على منتجات.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
