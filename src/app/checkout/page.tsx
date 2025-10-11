'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/hooks/use-cart';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import type { ShippingAddress, OrderItem } from '@/lib/types';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  address: z.string().min(5, 'العنوان مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  country: z.string().min(2, 'الدولة مطلوبة'),
  postalCode: z.string().min(3, 'الرمز البريدي مطلوب'),
});

const paymentSchema = z.object({
  cardNumber: z.string().length(16, 'رقم البطاقة يجب أن يكون 16 رقمًا'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'الصيغة الصحيحة MM/YY'),
  cvc: z.string().length(3, 'CVC يجب أن يكون 3 أرقام'),
});

const checkoutSchema = shippingSchema.merge(paymentSchema);

export default function CheckoutPage() {
  const { totalPrice, cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب عليك تسجيل الدخول لإتمام عملية الشراء.',
      });
      return;
    }

    const shippingAddress: ShippingAddress = {
      fullName: values.fullName,
      address: values.address,
      city: values.city,
      country: values.country,
      postalCode: values.postalCode,
    };
    
    try {
      // Use a batch write to save order and order items atomically
      const batch = writeBatch(firestore);

      // 1. Create the main order document
      const orderRef = doc(collection(firestore, `users/${user.uid}/orders`));
      batch.set(orderRef, {
        userId: user.uid,
        orderDate: serverTimestamp(),
        totalAmount: totalPrice,
        status: 'Processing',
        shippingAddress: shippingAddress,
      });

      // 2. Create a document for each item in the order
      for (const item of cartItems) {
        const orderItemRef = doc(collection(firestore, `users/${user.uid}/orders/${orderRef.id}/items`));
        const orderItem: Omit<OrderItem, 'id' | 'orderId'> = {
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrls[0], // Save the first image URL for the order item
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input placeholder="شارع، مبنى، شقة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>الدولة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>الرمز البريدي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات الدفع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (<FormItem><FormLabel>رقم البطاقة</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>تاريخ الانتهاء</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="cvc" render={({ field }) => (<FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="•••" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </CardContent>
              </Card>
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'جاري المعالجة...' : `ادفع ${totalPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}`}
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
            <div className="flex justify-between font-bold text-lg">
              <span>المجموع</span>
              <span>{totalPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
