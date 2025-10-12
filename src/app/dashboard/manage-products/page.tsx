'use client';

import { useState } from 'react';
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
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Product, Category, Brand } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
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
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب (10 أحرف على الأقل)'),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقمًا موجبًا'),
  originalPrice: z.coerce.number().optional().nullable(),
  category: z.string().min(1, 'الفئة مطلوبة'),
  brand: z.string().min(1, 'العلامة التجارية مطلوبة'),
  imageUrls: z.string().min(1, 'رابط صورة واحد على الأقل مطلوب'),
  imageHints: z.string().min(1, 'تلميح صورة واحد على الأقل مطلوب'),
  rating: z.coerce.number().min(0).max(5, 'التقييم يجب أن يكون بين 0 و 5'),
  sizes: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isDeal: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

function AddProductDialog({ categories, brands, onProductAdded }: { categories: Category[], brands: Brand[], onProductAdded: () => void }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      category: '',
      brand: '',
      imageUrls: '',
      imageHints: '',
      rating: 0,
      sizes: '',
      isFeatured: false,
      isDeal: false,
    },
  });

  async function onSubmit(values: ProductFormData) {
    if (!firestore) return;

    try {
      const newProduct: Omit<Product, 'id'> = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        brand: values.brand,
        imageUrls: values.imageUrls.split(',').map(url => url.trim()),
        imageHints: values.imageHints.split(',').map(hint => hint.trim()),
        rating: values.rating,
        sizes: values.sizes?.split(',').map(s => s.trim()) || [],
        isFeatured: values.isFeatured,
        isDeal: values.isDeal,
      };
      if (values.originalPrice && values.originalPrice > values.price) {
        newProduct.originalPrice = values.originalPrice;
      }

      await addDoc(collection(firestore, 'products'), newProduct);
      toast({ title: 'تمت إضافة المنتج بنجاح!' });
      form.reset();
      setIsOpen(false);
      onProductAdded();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما' });
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
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>إضافة منتج جديد</DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لإضافة منتج جديد إلى متجرك.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[60vh] p-6 pr-6 -mr-6">
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>السعر (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="originalPrice" render={({ field }) => (<FormItem><FormLabel>السعر الأصلي (اختياري)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>التقييم (0-5)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر فئة..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العلامة التجارية</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر علامة تجارية..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField control={form.control} name="sizes" render={({ field }) => (<FormItem><FormLabel>المقاسات (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="S, M, L, XL" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <FormField control={form.control} name="imageUrls" render={({ field }) => (<FormItem><FormLabel>روابط الصور (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="url1, url2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="imageHints" render={({ field }) => (<FormItem><FormLabel>تلميحات الصور (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="hint1, hint2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>منتج مميز</FormLabel>
                            <FormDescription>
                              إظهار هذا المنتج في قسم "منتجاتنا المميزة".
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="isDeal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>عرض اليوم</FormLabel>
                            <FormDescription>
                               إظهار هذا المنتج في قسم "العروض اليومية".
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}</Button>
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
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const productsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'products') : null), [firestore, updateTrigger]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const brandsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'brands') : null), [firestore]);
  const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);

  const handleProductAdded = () => {
    setUpdateTrigger(count => count + 1);
  };
  
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

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingBrands;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">إدارة المنتجات</h1>
        { !isLoading && categories && brands && (
           <AddProductDialog categories={categories} brands={brands} onProductAdded={handleProductAdded} />
        )}
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
                <TableHead>السعر الأصلي</TableHead>
                <TableHead>مميز</TableHead>
                <TableHead>عرض</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow><TableCell colSpan={8} className="text-center">جاري تحميل المنتجات...</TableCell></TableRow>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image src={product.imageUrls[0]} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                    <TableCell>{product.originalPrice ? product.originalPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' }) : '—'}</TableCell>
                    <TableCell>{product.isFeatured ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>{product.isDeal ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Edit button can be added here later */}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center">لم يتم العثور على منتجات.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
