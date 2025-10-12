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
import type { HeroSection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const heroSectionSchema = z.object({
  headline: z.string().min(5, 'العنوان الرئيسي مطلوب'),
  subheading: z.string().min(10, 'العنوان الفرعي مطلوب'),
  imageUrl: z.string().url('رابط الصورة غير صالح'),
  imageHint: z.string().min(2, 'تلميح الصورة مطلوب'),
  primaryActionText: z.string().min(2, 'نص الزر الأساسي مطلوب'),
  primaryActionLink: z.string().url('رابط الزر الأساسي غير صالح'),
  secondaryActionText: z.string().min(2, 'نص الزر الثانوي مطلوب'),
  secondaryActionLink: z.string().url('رابط الزر الثانوي غير صالح'),
});

type HeroSectionFormData = z.infer<typeof heroSectionSchema>;

export default function ManageHeroPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const heroSectionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'heroSection') : null),
    [firestore]
  );
  const { data: heroData, isLoading } = useDoc<HeroSection>(heroSectionRef);

  const form = useForm<HeroSectionFormData>({
    resolver: zodResolver(heroSectionSchema),
    defaultValues: {
      headline: '',
      subheading: '',
      imageUrl: '',
      imageHint: '',
      primaryActionText: '',
      primaryActionLink: '',
      secondaryActionText: '',
      secondaryActionLink: '',
    },
  });

  useEffect(() => {
    if (heroData) {
      form.reset(heroData);
    }
  }, [heroData, form]);

  async function onSubmit(values: HeroSectionFormData) {
    if (!firestore || !heroSectionRef) return;

    try {
      await setDoc(heroSectionRef, values, { merge: true });
      toast({ title: 'تم تحديث الواجهة الرئيسية بنجاح!' });
    } catch (error) {
      console.error("Error updating hero section:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما', description: 'لم يتم حفظ التغييرات.' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">إدارة الواجهة الرئيسية</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>محتوى قسم الـ Hero</CardTitle>
          <CardDescription>قم بتعديل المحتوى الذي يظهر في أعلى الصفحة الرئيسية.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
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
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان الرئيسي</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subheading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النص الفرعي</FormLabel>
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
                      <FormLabel>رابط صورة الخلفية</FormLabel>
                      <FormControl>
                        <Input placeholder="https://picsum.photos/seed/hero/1200/600" {...field} />
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
                        <Input placeholder="مثال: luxury product display" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="primaryActionText" render={({ field }) => (<FormItem><FormLabel>نص الزر الأساسي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="primaryActionLink" render={({ field }) => (<FormItem><FormLabel>رابط الزر الأساسي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="secondaryActionText" render={({ field }) => (<FormItem><FormLabel>نص الزر الثانوي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="secondaryActionLink" render={({ field }) => (<FormItem><FormLabel>رابط الزر الثانوي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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

    