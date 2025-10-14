
'use client';

import { useState, forwardRef, useEffect } from 'react';
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
import type { Product, Category, ProductVariant, ProductShippingAndService } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogFormDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
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
  color: z.string().min(1, "Color name is required."),
  hex: z.string().min(1, "Hex code is required."),
  imageUrls: z.string().min(1, "Image URLs are required."),
  imageHints: z.string().min(1, "Image hints are required."),
});

const shippingAndServiceSchema = z.object({
    cashOnDelivery: z.boolean().default(false),
    isReturnable: z.boolean().default(false),
    freeDelivery: z.boolean().default(false),
    isFulfilledByDoma: z.boolean().default(false),
    isSecureTransaction: z.boolean().default(false),
    returnPeriod: z.coerce.number().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  description: z.string().min(10, 'الوصف مطلوب (10 أحرف على الأقل)'),
  price: z.coerce.number().positive('السعر يجب أن يكون رقمًا موجبًا'),
  originalPrice: z.coerce.number().positive('السعر الأصلي يجب أن يكون رقمًا موجبًا').optional().nullable(),
  category: z.string().min(1, 'الفئة مطلوبة'),
  imageUrls: z.string().min(1, 'رابط صورة واحد على الأقل مطلوب'),
  imageHints: z.string().min(1, 'تلميح صورة واحد على الأقل مطلوب'),
  rating: z.coerce.number().min(0, 'التقييم يجب أن يكون بين 0 و 5').max(5, 'التقييم يجب أن يكون بين 0 و 5'),
  sizes: z.string().optional(),
  stock: z.coerce.number().min(0, 'الكمية يجب أن تكون رقمًا موجبًا'),
  isFeatured: z.boolean().default(false),
  isDeal: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  dealDurationHours: z.coerce.number().positive().optional().nullable(),
  material: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  features: z.string().optional(),
  variants: z.array(variantSchema).optional(),
  shippingAndService: shippingAndServiceSchema.optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onFormSubmit: () => void;
  children: React.ReactNode;
}

function ProductForm({ product, categories, onFormSubmit, children }: ProductFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const defaultShippingAndService = {
      cashOnDelivery: true,
      isReturnable: true,
      freeDelivery: false,
      isFulfilledByDoma: true,
      isSecureTransaction: true,
      returnPeriod: 30,
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        category: '',
        imageUrls: '',
        imageHints: '',
        rating: 0,
        sizes: '',
        stock: 0,
        isFeatured: false,
        isDeal: false,
        isBestSeller: false,
        dealDurationHours: undefined,
        material: '',
        countryOfOrigin: '',
        features: '',
        variants: [],
        shippingAndService: defaultShippingAndService,
    },
  });

  useEffect(() => {
    if (isOpen && product) {
        const productData = {
            ...product,
            price: product.price ?? 0,
            rating: product.rating ?? 0,
            stock: product.stock ?? 0,
            originalPrice: product.originalPrice ?? undefined,
            imageUrls: product.imageUrls?.join(', ') ?? '',
            imageHints: product.imageHints?.join(', ') ?? '',
            sizes: product.sizes?.join(', ') ?? '',
            features: product.features?.join(', ') ?? '',
            variants: product.variants?.map(v => ({
                ...v,
                imageUrls: v.imageUrls.join(', '),
                imageHints: v.imageHints.join(', '),
            })) ?? [],
            dealDurationHours: undefined,
            shippingAndService: product.shippingAndService || defaultShippingAndService,
        };
        form.reset(productData);
    } else if (isOpen) {
        form.reset({
            name: '',
            description: '',
            price: 0,
            originalPrice: undefined,
            category: '',
            imageUrls: '',
            imageHints: '',
            rating: 0,
            sizes: '',
            stock: 0,
            isFeatured: false,
            isDeal: false,
            isBestSeller: false,
            dealDurationHours: undefined,
            material: '',
            countryOfOrigin: '',
            features: '',
            variants: [],
            shippingAndService: defaultShippingAndService,
        });
    }
  }, [isOpen, product, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const isDeal = useWatch({
    control: form.control,
    name: 'isDeal'
  });

  const isEditing = !!product;

  async function onSubmit(values: ProductFormData) {
      if (!firestore) return;
  
      try {
          const variantsData: ProductVariant[] | undefined = values.variants?.filter(v => v.color && v.hex && v.imageUrls && v.imageHints).map(v => ({
              color: v.color!,
              hex: v.hex!,
              imageUrls: v.imageUrls!.split(',').map(url => url.trim()),
              imageHints: v.imageHints!.split(',').map(hint => hint.trim()),
          }));
  
          const productData: Partial<Omit<Product, 'id'>> = {
              name: values.name,
              description: values.description,
              price: values.price,
              category: values.category,
              imageUrls: values.imageUrls.split(',').map(url => url.trim()),
              imageHints: values.imageHints.split(',').map(hint => hint.trim()),
              rating: values.rating,
              sizes: values.sizes ? values.sizes.split(',').map(s => s.trim()) : [],
              stock: values.stock,
              isFeatured: values.isFeatured,
              isDeal: values.isDeal,
              isBestSeller: values.isBestSeller,
              material: values.material,
              countryOfOrigin: values.countryOfOrigin,
              features: values.features ? values.features.split(',').map(f => f.trim()) : [],
              variants: variantsData && variantsData.length > 0 ? variantsData : [],
              shippingAndService: values.shippingAndService,
          };
          
          if (values.originalPrice) {
            productData.originalPrice = values.originalPrice;
          } else {
            productData.originalPrice = undefined;
          }
          
          if (values.isDeal && values.dealDurationHours) {
              productData.dealEndDate = Timestamp.fromMillis(Date.now() + values.dealDurationHours * 60 * 60 * 1000);
          } else if (values.isDeal && isEditing && product?.dealEndDate && product.dealEndDate.toMillis() > Date.now()) {
            // Keep existing end date if not changed
            productData.dealEndDate = product.dealEndDate;
          } else {
             productData.dealEndDate = undefined;
          }

          if (isEditing) {
            const productRef = doc(firestore, 'products', product.id);
            // Firestore does not support `undefined` values. We need to create a clean object.
            const cleanProductData = Object.fromEntries(Object.entries(productData).filter(([_, v]) => v !== undefined));
            await updateDoc(productRef, cleanProductData);
            toast({ title: 'تم تحديث المنتج بنجاح!' });
          } else {
            await addDoc(collection(firestore, 'products'), productData as Omit<Product, 'id'>);
            toast({ title: 'تمت إضافة المنتج بنجاح!' });
          }

          setIsOpen(false);
          onFormSubmit();

      } catch (error) {
          console.error("Error saving product:", error);
          toast({ variant: 'destructive', title: 'حدث خطأ ما', description: (error as Error).message });
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          <DialogFormDescription>
            {isEditing ? 'قم بتعديل تفاصيل المنتج أدناه.' : 'املأ النموذج أدناه لإضافة منتج جديد إلى متجرك.'}
          </DialogFormDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] w-full pr-6">
              <div className="space-y-4 my-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>السعر (EGP)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="originalPrice" render={({ field }) => (<FormItem><FormLabel>السعر الأصلي (اختياري)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <FormField control={form.control} name="stock" render={({ field }) => (<FormItem><FormLabel>الكمية المتاحة</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>التقييم (0-5)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                
                <FormField control={form.control} name="sizes" render={({ field }) => (<FormItem><FormLabel>المقاسات (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="S, M, L, XL" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`variants.${index}.color`} render={({ field }) => (<FormItem><FormLabel>اسم اللون</FormLabel><FormControl><Input placeholder="أحمر" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`variants.${index}.hex`} render={({ field }) => (<FormItem><FormLabel>كود اللون (Hex)</FormLabel><FormControl><Input type="color" className='p-0 h-10 w-full' {...field} /></FormControl><FormMessage /></FormItem>)} />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="material" render={({ field }) => (<FormItem><FormLabel>الخامة</FormLabel><FormControl><Input placeholder="قطن، جلد، إلخ." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="countryOfOrigin" render={({ field }) => (<FormItem><FormLabel>بلد الصنع</FormLabel><FormControl><Input placeholder="تركيا، فيتنام، إلخ." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="features" render={({ field }) => (<FormItem><FormLabel>ميزات إضافية (مفصولة بفاصلة)</FormLabel><FormControl><Input placeholder="مقاوم للماء، جودة عالية، ..." {...field} /></FormControl><FormMessage /></FormItem>)} />

                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">ميزات الشحن والخدمة</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAndService.cashOnDelivery"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>الدفع عند الاستلام</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAndService.isReturnable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>قابل للإرجاع</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="shippingAndService.freeDelivery"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>توصيل مجاني</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="shippingAndService.isFulfilledByDoma"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>يتم الشحن بواسطة دوما</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="shippingAndService.isSecureTransaction"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>معاملة آمنة</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="shippingAndService.returnPeriod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>فترة الإرجاع (أيام)</FormLabel>
                                <FormControl><Input type="number" placeholder="30" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>منتج مميز</FormLabel>
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
                                سيتم بدء العد التنازلي من الآن. إذا تركته فارغًا، سيتم استخدام أي تاريخ انتهاء حالي.
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'حفظ المنتج')}
              </Button>
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

  const handleFormSubmit = () => {
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

  const isLoading = isLoadingProducts || isLoadingCategories;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-headline font-bold">إدارة المنتجات</h1>
        { !isLoading && categories && (
           <ProductForm categories={categories} onFormSubmit={handleFormSubmit}>
              <Button>
                <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">إضافة منتج جديد</span>
              </Button>
           </ProductForm>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>عرض وتعديل وحذف المنتجات الموجودة في متجرك.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">الصورة</TableHead>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>مميز</TableHead>
                  <TableHead>عرض</TableHead>
                  <TableHead>الأكثر مبيعًا</TableHead>
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
                        {product.imageUrls && product.imageUrls.length > 0 &&
                          <Image src={product.imageUrls[0]} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                        }
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.isFeatured ? 'نعم' : 'لا'}</TableCell>
                      <TableCell>{product.isDeal ? 'نعم' : 'لا'}</TableCell>
                      <TableCell>{product.isBestSeller ? 'نعم' : 'لا'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          {!isLoading && categories && (
                            <ProductForm product={product} categories={categories} onFormSubmit={handleFormSubmit}>
                               <Button variant="ghost" size="icon">
                                 <Edit className="h-4 w-4" />
                               </Button>
                            </ProductForm>
                          )}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    