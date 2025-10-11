'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Brand } from '@/lib/types';
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

const brandSchema = z.object({
  name: z.string().min(2, 'اسم العلامة التجارية مطلوب'),
  logoUrl: z.string().url('رابط الشعار غير صالح'),
  logoHint: z.string().min(2, 'تلميح الشعار مطلوب (كلمتين كحد أقصى)'),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function ManageBrandsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const brandsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'brands') : null),
    [firestore]
  );
  const { data: brands, isLoading: isLoadingBrands, error } = useCollection<Brand>(brandsQuery);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', logoUrl: '', logoHint: '' },
  });

  const handleOpenForm = (brand: Brand | null = null) => {
    setEditingBrand(brand);
    if (brand) {
      form.reset({ name: brand.name, logoUrl: brand.logoUrl, logoHint: brand.logoHint });
    } else {
      form.reset({ name: '', logoUrl: '', logoHint: '' });
    }
    setIsFormOpen(true);
  };

  async function onSubmit(values: BrandFormData) {
    if (!firestore) return;

    try {
      if (editingBrand) {
        const brandRef = doc(firestore, 'brands', editingBrand.id);
        await updateDoc(brandRef, values);
        toast({ title: 'تم تحديث العلامة التجارية بنجاح!' });
      } else {
        await addDoc(collection(firestore, 'brands'), values);
        toast({ title: 'تمت إضافة العلامة التجارية بنجاح!' });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving brand:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما' });
    }
  }

  async function handleDelete(brandId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'brands', brandId));
      toast({ title: 'تم حذف العلامة التجارية بنجاح' });
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحذف' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">إدارة العلامات التجارية</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية جديدة'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العلامة التجارية</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الشعار</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="logoHint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تلميح الشعار (AI)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: famous brand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">إلغاء</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العلامات التجارية</CardTitle>
          <CardDescription>عرض وتعديل وحذف العلامات التجارية الموجودة في متجرك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الشعار</TableHead>
                <TableHead>اسم العلامة التجارية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBrands ? (
                <TableRow><TableCell colSpan={3} className="text-center">جاري تحميل العلامات التجارية...</TableCell></TableRow>
              ) : brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                     <TableCell>
                      <Image src={brand.logoUrl} alt={brand.name} width={80} height={40} className="object-contain rounded-md bg-muted p-1" />
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(brand)}>
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
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف العلامة التجارية بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(brand.id)}>متابعة</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">لم يتم العثور على علامات تجارية.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
