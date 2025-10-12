'use client';

import { useState, forwardRef } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { Product, Category, Brand, ProductVariant } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const variantSchema = z.object({
  color: z.string().min(1, "اسم اللون مطلوب"),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "كود الهيكس غير صالح"),
  imageUrls: z.string().min(1, 'رابط صورة واحد على الأقل مطلوب'),
  imageHints: z.string().min(1, 'تلميح صورة واحد على الأقل مطلوب'),
});

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب (10 أحرف على الأقل)'),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقمًا موجبًا'),
  originalPrice: z.coerce.number().optional().nullable(),
  category: z.string().optional(),
  brand: z.string().optional(),
  imageUrls: z.string().optional(),
  imageHints: z.string().optional(),
  rating: z.coerce.number().min(0).max(5, 'التقييم يجب أن يكون بين 0 و 5').optional(),
  sizes: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isDeal: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  dealDurationHours: z.coerce.number().optional().nullable(),
  material: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  features: z.string().optional(),
  variants: z.array(variantSchema).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductFormDialog = forwardRef<HTMLDivElement, { categories: Category[], brands: Brand[], onProductAdded: () => void }>(
  function ProductFormDialog({ categories, brands, onProductAdded }, ref) {
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
        isBestSeller: false,
        dealDurationHours: undefined,
        material: '',
        countryOfOrigin: '',
        features: '',
        variants: [],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "variants",
    });

    const isDeal = useWatch({
      control: form.control,
      name: 'isDeal'
    });

    async function onSubmit(values: ProductFormData) {
      if (!firestore) return;

      try {
          const variants: ProductVariant[] | undefined = values.variants?.map(v => ({
              ...v,
              imageUrls: v.imageUrls.split(',').map(url => url.trim()),
              imageHints: v.imageHints.split(',').map(hint => hint.trim()),
          }));

        const newProductData: Omit<Product, 'id'> = {
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category || 'غير مصنف',
          brand: values.brand || 'غير محدد',
          imageUrls: values.imageUrls?.split(',').map(url => url.trim()) || [],
          imageHints: values.imageHints?.split(',').map(hint => hint.trim()) || [],
          variants: variants,
          rating: values.rating || 0,
          sizes: values.sizes?.split(',').map(s => s.trim()) || [],
          isFeatured: values.isFeatured,
          isDeal: values.isDeal,
          isBestSeller: values.isBestSeller,
          originalPrice: values.originalPrice || undefined,
          dealEndDate: values.isDeal && values.dealDurationHours 
            ? Timestamp.fromMillis(Date.now() + values.dealDurationHours * 60 * 60 * 1000) 
            : undefined,
          material: values.material,
          countryOfOrigin: values.countryOfOrigin,
          features: values.features?.split(',').map(f => f.trim()) || [],
        };
        
        await addDoc(collection(firestore, 'products'), newProductData);
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
            <CardDescription>
              املأ النموذج أدناه لإضافة منتج جديد إلى متجرك.
            </CardDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[65vh] w-full pr-6">
                <div className="space-y-4 my-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>السعر (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="originalPrice" render={({ field }) => (<FormItem><FormLabel>السعر الأصلي (اختياري)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>التقييم (0-5) (اختياري)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفئة (اختياري)</FormLabel>
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
                          <FormLabel>العلامة التجارية (اختياري)</FormLabel>
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
                  
                  <FormField control={form.control} name="imageUrls" render={({ field }) => (<FormItem><FormLabel>روابط الصور الافتراضية (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="url1, url2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="imageHints" render={({ field }) => (<FormItem><FormLabel>تلميحات الصور الافتراضية (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="hint1, hint2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  
                  <Separator className="my-6" />

                  <div>
                      <h3 className="text-lg font-medium mb-2">الألوان المتوفرة</h3>
                      <div className="space-y-4">
                          {fields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-md relative space-y-3">
                                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 left-2 h-6 w-6" onClick={() => remove(index)}>
                                      <X className="h-4 w-4" />
                                  </Button>
                                  <div className="grid grid-cols-2 gap-4">
                                      <FormField control={form.control} name={`variants.${index}.color`} render={({ field }) => (<FormItem><FormLabel>اسم اللون</FormLabel><FormControl><Input placeholder="أحمر" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name={`variants.${index}.hex`} render={({ field }) => (<FormItem><FormLabel>كود اللون (Hex)</FormLabel><FormControl><Input type="color" className='p-0 h-10' {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  </div>
                                  <FormField control={form.control} name={`variants.${index}.imageUrls`} render={({ field }) => (<FormItem><FormLabel>روابط صور اللون</FormLabel><FormControl><Input placeholder="url1, url2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  <FormField control={form.control} name={`variants.${index}.imageHints`} render={({ field }) => (<FormItem><FormLabel>تلميحات صور اللون</FormLabel><FormControl><Input placeholder="hint1, hint2, ..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                              </div>
                          ))}
                      </div>
                       <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => append({ color: '', hex: '#000000', imageUrls: '', imageHints: '' })}
                      >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          إضافة لون
                      </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="material" render={({ field }) => (<FormItem><FormLabel>الخامة</FormLabel><FormControl><Input placeholder="قطن، جلد، إلخ." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="countryOfOrigin" render={({ field }) => (<FormItem><FormLabel>بلد الصنع</FormLabel><FormControl><Input placeholder="تركيا، فيتنام، إلخ." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="features" render={({ field }) => (<FormItem><FormLabel>ميزات إضافية (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="مقاوم للماء، جودة عالية، ..." {...field} /></FormControl><FormMessage /></FormItem>)} />


                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>منتج مميز</FormLabel>
                              <FormDescription>
                                عرضه في قسم "منتجاتنا المميزة".
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
                                 عرضه في قسم "العروض اليومية".
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
                        name="isBestSeller"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>الأكثر مبيعًا</FormLabel>
                              <FormDescription>
                                عرضه في قسم "الأكثر مبيعًا".
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
                   <div className={cn("transition-all duration-300 overflow-hidden", isDeal ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                      <div className="pt-4">
                          <FormField
                          control={form.control}
                          name="dealDurationHours"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>مدة العرض (بالساعات)</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="24" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormDescription>
                                  سيتم بدء العد التنازلي من الآن.
                              </FormDescription>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </div>
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
)
ProductFormDialog.displayName = "ProductFormDialog";

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
           <ProductFormDialog categories={categories} brands={brands} onProductAdded={handleProductAdded} />
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
                <TableHead>الأصلي</TableHead>
                <TableHead>مميز</TableHead>
                <TableHead>عرض</TableHead>
                <TableHead>الأكثر مبيعًا</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow><TableCell colSpan={9} className="text-center">جاري تحميل المنتجات...</TableCell></TableRow>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrls && product.imageUrls.length > 0 &&
                        <Image src={product.imageUrls[0]} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                    <TableCell>{product.originalPrice ? product.originalPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' }) : '—'}</TableCell>
                    <TableCell>{product.isFeatured ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>{product.isDeal ? 'نعم' : 'لا'}</TableCell>
                    <TableCell>{product.isBestSeller ? 'نعم' : 'لا'}</TableCell>
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
                <TableRow><TableCell colSpan={9} className="text-center">لم يتم العثور على منتجات.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    