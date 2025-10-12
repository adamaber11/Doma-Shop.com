
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { PopupModal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const popupSchema = z.object({
  isActive: z.boolean().default(false),
  title: z.string().min(5, 'العنوان مطلوب'),
  content: z.string().min(10, 'المحتوى مطلوب'),
  imageUrl: z.string().url('رابط الصورة غير صالح'),
  imageHint: z.string().min(2, 'تلميح الصورة مطلوب'),
  callToActionText: z.string().min(2, 'نص الزر مطلوب'),
  callToActionLink: z.string().url('رابط الزر غير صالح'),
});

type PopupFormData = z.infer<typeof popupSchema>;

export default function ManagePopupPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const popupRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'popupModal') : null),
    [firestore]
  );
  const { data: popupData, isLoading } = useDoc<PopupModal>(popupRef);

  const form = useForm<PopupFormData>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      isActive: false,
      title: '',
      content: '',
      imageUrl: '',
      imageHint: '',
      callToActionText: '',
      callToActionLink: '',
    },
  });

  useEffect(() => {
    if (popupData) {
      form.reset(popupData);
    }
  }, [popupData, form]);

  async function onSubmit(values: PopupFormData) {
    if (!firestore || !popupRef) return;

    try {
      await setDoc(popupRef, values, { merge: true });
      toast({ title: 'تم تحديث الإعلان المنبثق بنجاح!' });
    } catch (error) {
      console.error("Error updating popup modal:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما', description: 'لم يتم حفظ التغييرات.' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">إدارة الإعلان المنبثق</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>محتوى الإعلان</CardTitle>
          <CardDescription>قم بتعديل المحتوى الذي يظهر في الإعلان المنبثق على مستوى الموقع.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-32 ml-auto" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>تفعيل الإعلان</FormLabel>
                        <FormMessage />
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المحتوى</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input placeholder="https://picsum.photos/seed/popup/400/300" {...field} />
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
                        <Input placeholder="مثال: special offer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="callToActionText" render={({ field }) => (<FormItem><FormLabel>نص زر الإجراء</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="callToActionLink" render={({ field }) => (<FormItem><FormLabel>رابط زر الإجراء</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
