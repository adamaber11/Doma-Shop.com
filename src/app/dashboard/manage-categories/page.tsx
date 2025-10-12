
'use client';

import { useState, useMemo } from 'react';
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
import type { Category } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const categorySchema = z.object({
  name: z.string().min(2, 'اسم الفئة مطلوب'),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url('رابط الصورة مطلوب').optional().or(z.literal('')),
  imageHint: z.string().min(2, 'تلميح الصورة مطلوب').optional().or(z.literal('')),
  description: z.string().min(10, 'الوصف مطلوب').optional().or(z.literal('')),
  callToActionText: z.string().min(2, 'نص الزر مطلوب').optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function ManageCategoriesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: isLoadingCategories, error } = useCollection<Category>(categoriesQuery);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: null,
      imageUrl: '',
      imageHint: '',
      description: '',
      callToActionText: '',
    },
  });

  const categoryMap = useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map(c => [c.id, c.name]));
  }, [categories]);

  const handleOpenForm = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.reset({
        name: category.name,
        parentId: category.parentId,
        imageUrl: category.imageUrl || '',
        imageHint: category.imageHint || '',
        description: category.description || '',
        callToActionText: category.callToActionText || '',
      });
    } else {
      form.reset({
        name: '',
        parentId: null,
        imageUrl: '',
        imageHint: '',
        description: '',
        callToActionText: '',
      });
    }
    setIsFormOpen(true);
  };

  async function onSubmit(values: CategoryFormData) {
    if (!firestore) return;

    try {
      const dataToSave = {
        ...values,
        parentId: values.parentId || null
      };

      if (editingCategory) {
        const categoryRef = doc(firestore, 'categories', editingCategory.id);
        await updateDoc(categoryRef, dataToSave);
        toast({ title: 'تم تحديث الفئة بنجاح!' });
      } else {
        await addDoc(collection(firestore, 'categories'), dataToSave);
        toast({ title: 'تمت إضافة الفئة بنجاح!' });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما' });
    }
  }

  async function handleDelete(categoryId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'categories', categoryId));
      toast({ title: 'تم حذف الفئة بنجاح' });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحذف' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">إدارة الفئات</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[70vh] w-full pr-6">
                    <div className="space-y-4 my-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>اسم الفئة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                        control={form.control}
                        name="parentId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>الفئة الرئيسية (اختياري)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'} disabled={isLoadingCategories}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="اختر فئة رئيسية..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="none">-- لا يوجد --</SelectItem>
                                {categories?.filter(c => c.id !== editingCategory?.id).map((category) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>رابط الصورة</FormLabel><FormControl><Input placeholder="https://picsum.photos/seed/cat1/600/400" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>تلميح الصورة (AI)</FormLabel><FormControl><Input placeholder="مثال: mens fashion" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="callToActionText" render={({ field }) => (<FormItem><FormLabel>نص زر الإجراء</FormLabel><FormControl><Input placeholder="تسوق الآن" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                 </ScrollArea>
                <DialogFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفئات</CardTitle>
          <CardDescription>عرض وتعديل وحذف الفئات الموجودة في متجرك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>اسم الفئة</TableHead>
                <TableHead>الفئة الرئيسية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCategories ? (
                <TableRow><TableCell colSpan={4} className="text-center">جاري تحميل الفئات...</TableCell></TableRow>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.imageUrl && <Image src={category.imageUrl} alt={category.name} width={60} height={40} className="object-cover rounded-md" />}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.parentId ? categoryMap.get(category.parentId) || 'غير معروف' : '—'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(category)}>
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
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الفئة بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>متابعة</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center">لم يتم العثور على فئات.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
