
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/hooks/use-cart';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import type { ShippingAddress, OrderItem, ShippingGovernorate } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  address: z.string().min(5, 'العنوان مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  governorate: z.string().min(2, 'المحافظة مطلوبة'),
  postalCode: z.string().min(3, 'الرمز البريدي مطلوب'),
});

export default function CheckoutPage() {
  const { totalPrice, cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedGovernorateCost, setSelectedGovernorateCost] = useState<number | null>(null);

  const governoratesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shippingGovernorates') : null),
    [firestore]
  );
  const { data: governorates, isLoading: isLoadingGovernorates } = useCollection<ShippingGovernorate>(governoratesQuery);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      governorate: '',
      postalCode: '',
    },
  });

  const finalTotal = useMemo(() => {
      return totalPrice + (selectedGovernorateCost ?? 0);
  }, [totalPrice, selectedGovernorateCost]);

  const handleGovernorateChange = (governorateId: string) => {
    const selected = governorates?.find(g => g.id === governorateId);
    if (selected) {
        setSelectedGovernorateCost(selected.shippingCost);
        form.setValue('governorate', selected.name);
    } else {
        setSelectedGovernorateCost(null);
        form.setValue('governorate', '');
    }
  };

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب عليك تسجيل الدخول لإتمام عملية الشراء.',
      });
      return;
    }
    if (selectedGovernorateCost === null) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى اختيار محافظة الشحن.' });
        return;
    }

    const shippingAddress: ShippingAddress = {
      fullName: values.fullName,
      address: values.address,
      city: values.city,
      governorate: values.governorate,
      postalCode: values.postalCode,
    };
    
    try {
      const batch = writeBatch(firestore);

      const orderRef = doc(collection(firestore, `users/${user.uid}/orders`));
      batch.set(orderRef, {
        userId: user.uid,
        orderDate: serverTimestamp(),
        totalAmount: finalTotal,
        shippingCost: selectedGovernorateCost,
        status: 'Processing',
        shippingAddress: shippingAddress,
      });

      for (const item of cartItems) {
        const orderItemRef = doc(collection(firestore, `users/${user.uid}/orders/${orderRef.id}/items`));
        const orderItem: Omit<OrderItem, 'id' | 'orderId'> = {
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrls[0],
            quantity: item.quantity,
            itemPrice: item.price,
            selectedSize: item.selectedSize,
        }
        batch.set(orderItemRef, orderItem);
      }

      await batch.commit();

      toast({
        title: 'تم تقديم الطلب بنجاح!',
        description: 'شكرًا لك على الشراء. سيتم توجيهك إلى صفحة الطلبات.',
      });
      clearCart();
      setTimeout(() => {
        router.push('/orders');
      }, 2000);

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ أثناء تقديم الطلب',
        description: 'يرجى المحاولة مرة أخرى.',
      });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <h1 className="text-4xl font-headline font-bold mb-8">إتمام الشراء</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشحن</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسمك الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="governorate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المحافظة</FormLabel>
                        <Select
                          onValueChange={(value) => handleGovernorateChange(value)}
                          disabled={isLoadingGovernorates || !governorates}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر محافظتك..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {governorates?.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name} ({g.shippingCost.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان التفصيلي</FormLabel>
                        <FormControl>
                          <Input placeholder="شارع، مبنى، شقة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>المدينة / المنطقة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>الرمز البريدي (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                  <CardDescription>الدفع نقدًا عند استلام طلبك.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center p-4 border rounded-md bg-muted">
                        <Truck className="h-6 w-6 mr-4 text-muted-foreground" />
                        <div className='flex flex-col'>
                            <span className="font-semibold">الدفع عند الاستلام</span>
                            <span className="text-sm text-muted-foreground">سيتم تحصيل المبلغ عند توصيل الطلب.</span>
                        </div>
                    </div>
                     <p className="mt-4 text-center text-sm font-semibold text-destructive p-2 rounded-md border border-destructive/20 bg-destructive/10">
                        الشحن من 3 إلى 7 أيام
                    </p>
                </CardContent>
              </Card>
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري المعالجة...' : `تأكيد الطلب`}
              </Button>
            </form>
          </Form>
        </div>
        <div className="md:col-span-1">
          <div className="bg-card p-6 rounded-lg shadow-sm sticky top-24">
            <h2 className="text-xl font-headline font-semibold mb-4">طلبك</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span>{item.name} x {item.quantity}</span>
                    {item.selectedSize && <span className="text-xs text-muted-foreground block">المقاس: {item.selectedSize}</span>}
                  </div>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span>
                </div>
                 <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>
                        {selectedGovernorateCost !== null 
                            ? selectedGovernorateCost.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' }) 
                            : '---'}
                    </span>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>المجموع</span>
              <span>{finalTotal.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    