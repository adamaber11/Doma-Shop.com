
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
import type { SocialLinks } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const socialLinksSchema = z.object({
  facebook: z.string().url('رابط فيسبوك غير صالح').optional().or(z.literal('')),
  instagram: z.string().url('رابط انستغرام غير صالح').optional().or(z.literal('')),
  tiktok: z.string().url('رابط تيك توك غير صالح').optional().or(z.literal('')),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

export default function ManageSocialsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const socialLinksRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'socialLinks') : null),
    [firestore]
  );
  const { data: socialData, isLoading } = useDoc<SocialLinks>(socialLinksRef);

  const form = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      facebook: '',
      instagram: '',
      tiktok: '',
    },
  });

  useEffect(() => {
    if (socialData) {
      form.reset(socialData);
    }
  }, [socialData, form]);

  async function onSubmit(values: SocialLinksFormData) {
    if (!firestore || !socialLinksRef) return;

    try {
      await setDoc(socialLinksRef, values, { merge: true });
      toast({ title: 'تم تحديث روابط التواصل الاجتماعي بنجاح!' });
    } catch (error) {
      console.error("Error updating social links:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما', description: 'لم يتم حفظ التغييرات.' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">إدارة روابط التواصل الاجتماعي</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>روابط الصفحات</CardTitle>
          <CardDescription>قم بتحديث الروابط التي تظهر في تذييل الموقع.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-32 ml-auto" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط فيسبوك</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/yourpage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط انستغرام</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط تيك توك</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tiktok.com/@yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
