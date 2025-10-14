
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
import type { ProductCardMessage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const messageSchema = z.object({
  isEnabled: z.boolean().default(false),
  text: z.string().max(50, 'الرسالة يجب أن تكون 50 حرفًا أو أقل').optional(),
  textColor: z.string().optional(),
});

type MessageFormData = z.infer<typeof messageSchema>;

const colorOptions = [
  { value: 'text-foreground', label: 'أسود' },
  { value: 'text-destructive', label: 'أحمر' },
  { value: 'text-green-600', label: 'أخضر' },
  { value: 'text-blue-600', label: 'أزرق' },
  { value: 'text-primary', label: 'اللون الأساسي' },
];

export default function ManageCardMessagePage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const messageRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'productCardMessage') : null),
    [firestore]
  );
  const { data: messageData, isLoading } = useDoc<ProductCardMessage>(messageRef);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      isEnabled: false,
      text: '',
      textColor: 'text-destructive',
    },
  });

  useEffect(() => {
    if (messageData) {
      form.reset(messageData);
    }
  }, [messageData, form]);

  async function onSubmit(values: MessageFormData) {
    if (!firestore || !messageRef) return;
    
    // Ensure text is not undefined if isEnabled is true
    if (values.isEnabled && !values.text) {
        form.setError("text", { type: "manual", message: "نص الرسالة مطلوب عند تفعيلها."});
        return;
    }

    try {
      await setDoc(messageRef, values, { merge: true });
      toast({ title: 'تم تحديث الرسالة بنجاح!' });
    } catch (error) {
      console.error("Error updating product card message:", error);
      toast({ variant: 'destructive', title: 'حدث خطأ ما', description: 'لم يتم حفظ التغييرات.' });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">إدارة رسالة بطاقة المنتج</h1>
      
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>محتوى الرسالة</CardTitle>
          <CardDescription>
            قم بتعيين رسالة ترويجية تظهر على جميع بطاقات المنتجات في متجرك.
          </CardDescription>
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
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>تفعيل الرسالة</FormLabel>
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
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نص الرسالة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: شحن مجاني" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لون الخط</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر لونًا..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={option.value}>{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

    