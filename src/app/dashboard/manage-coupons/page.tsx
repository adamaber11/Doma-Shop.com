'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { CouponGame } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const couponSchema = z.object({
    coupons: z.array(z.object({ value: z.string().min(1, 'حقل الكوبون مطلوب') })).length(7, 'يجب إدخال 7 كوبونات'),
    correctCouponIndex: z.coerce.number().min(0).max(6),
    discountPercentage: z.coerce.number().min(1, 'نسبة الخصم مطلوبة').max(100, 'النسبة يجب أن تكون بين 1 و 100'),
});

export default function ManageCouponsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const couponGameRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'couponGames', 'active') : null),
      [firestore]
    );
    const { data: couponGame, isLoading } = useDoc<CouponGame>(couponGameRef);

    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            coupons: Array.from({ length: 7 }, () => ({ value: '' })),
            correctCouponIndex: 0,
            discountPercentage: 10,
        },
    });

    useEffect(() => {
        if (couponGame) {
            form.reset(couponGame);
        }
    }, [couponGame, form]);

    const { fields } = useFieldArray({
        control: form.control,
        name: 'coupons',
    });

    async function onSubmit(values: z.infer<typeof couponSchema>) {
        if (!firestore) return;

        try {
            await setDoc(doc(firestore, 'couponGames', 'active'), values);
            toast({
                title: "تم حفظ لعبة الكوبونات",
                description: `تم تحديث لعبة الكوبونات بنجاح.`,
            });
        } catch (error) {
            console.error("Error saving coupon game:", error);
            toast({ variant: 'destructive', title: 'حدث خطأ ما' });
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-headline font-bold">إدارة الكوبونات</h1>
            </div>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>إعدادات لعبة الكوبونات</CardTitle>
                    <CardDescription>
                        أدخل 7 أكواد للكوبونات، واختر الكوبون الصحيح، ثم حدد نسبة الخصم. يمكن لكل عميل تجربة حظه مرة واحدة فقط.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({length: 7}).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                            </div>
                            <Skeleton className="h-10 w-1/3" />
                            <Skeleton className="h-10 w-48" />
                         </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="space-y-4">
                                    <FormLabel>أكواد الكوبونات (7 كوبونات)</FormLabel>
                                    <RadioGroup
                                        onValueChange={(value) => form.setValue('correctCouponIndex', parseInt(value))}
                                        value={form.watch('correctCouponIndex').toString()}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {fields.map((field, index) => (
                                            <FormField
                                                key={field.id}
                                                control={form.control}
                                                name={`coupons.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-4 p-3 border rounded-lg bg-background">
                                                        <FormControl>
                                                            <RadioGroupItem value={index.toString()} id={`r-${index}`} />
                                                        </FormControl>
                                                        <FormLabel htmlFor={`r-${index}`} className="flex-grow m-0 !text-sm font-normal cursor-pointer">
                                                            الكوبون الصحيح
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={`كود الكوبون #${index + 1}`} className="flex-grow"/>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </RadioGroup>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="discountPercentage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>نسبة الخصم للكوبون الصحيح (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="مثال: 15" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    <Gift className="mr-2 h-4 w-4" />
                                    {form.formState.isSubmitting ? 'جاري الحفظ...' : 'حفظ لعبة الكوبونات'}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
