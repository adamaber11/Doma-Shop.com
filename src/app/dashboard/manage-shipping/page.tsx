
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
import type { ShippingGovernorate } from '@/lib/types';
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

const governorateSchema = z.object({
  name: z.string().min(2, 'اسم المحافظة مطلوب'),
  shippingCost: z.coerce.number().min(0, 'سعر الشحن يجب أن يكون رقمًا موجبًا'),
});

type GovernorateFormData = z.infer<typeof governorateSchema>;

export default function ManageShippingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGovernorate, setEditingGovernorate] = useState<ShippingGovernorate | null>(null);

  const governoratesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shippingGovernorates') : null),
    [firestore]
  );
  const { data: governorates, isLoading: isLoadingGovernorates } = useCollection<ShippingGovernorate>(governoratesQuery);

  const form = useForm<GovernorateFormData>({
    resolver: zodResolver(governorateSchema),
    defaultValues: { name: '', shippingCost: 0 },
  });

  const handleOpenForm = (gov: ShippingGovernorate | null = null) => {
    setEditingGovernorate(gov);
    if (gov) {
      form.reset({ name: gov.name, shippingCost: gov.shippingCost });
    } else {
      form.reset({ name: '', shippingCost: 0 });
    }
    setIsFormOpen(true);
  };

  async function onSubmit(values: GovernorateFormData) {
    if (!firestore) return;

    try {
      if (editingGovernorate) {
        const govRef = doc(firestore, 'shippingGovernorates', editingGovernorate.id);
        await updateDoc(govRef, values);
        toast({ title: 'تم تحديث المحافظة بنجاح!' });
      } else {
        await addDoc(collection(firestore, 'shippingGovernorates'), values);
        toast({ title: 'تمت إضافة المحافظة بنجاح!' });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving governorate:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما' });
    }
  }

  async function handleDelete(governorateId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'shippingGovernorates', governorateId));
      toast({ title: 'تم حذف المحافظة بنجاح' });
    } catch (error) {
      console.error("Error deleting governorate:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء الحذف' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">إدارة الشحن</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة محافظة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGovernorate ? 'تعديل المحافظة' : 'إضافة محافظة جديدة'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المحافظة</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر الشحن (AED)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
          <CardTitle>قائمة المحافظات وأسعار الشحن</CardTitle>
          <CardDescription>عرض وتعديل أسعار الشحن لكل محافظة.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المحافظة</TableHead>
                <TableHead>سعر الشحن</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingGovernorates ? (
                <TableRow><TableCell colSpan={3} className="text-center">جاري تحميل البيانات...</TableCell></TableRow>
              ) : governorates && governorates.length > 0 ? (
                governorates.map((gov) => (
                  <TableRow key={gov.id}>
                    <TableCell className="font-medium">{gov.name}</TableCell>
                    <TableCell>{gov.shippingCost.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(gov)}>
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
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المحافظة بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(gov.id)}>متابعة</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">لم يتم إضافة أي محافظات بعد.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    