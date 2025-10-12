'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, cartCount } = useCart();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">سلة التسوق</h1>

      {cartCount === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-semibold">سلتك فارغة</h2>
          <p className="mt-2 text-muted-foreground">يبدو أنك لم تقم بإضافة أي منتجات بعد.</p>
          <Button asChild className="mt-6">
            <Link href="/">ابدأ التسوق</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
                <Image
                  src={item.imageUrls[0]}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-24 h-24 sm:w-24 sm:h-24"
                  data-ai-hint={item.imageHints[0]}
                />
                <div className="flex-grow text-center sm:text-right">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.selectedSize && (
                    <p className="text-sm text-muted-foreground">المقاس: {item.selectedSize}</p>
                  )}
                  <p className="text-muted-foreground text-sm">
                    {item.price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-16 h-10 text-center"
                    min="1"
                  />
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-2xl font-headline font-semibold mb-4">ملخص الطلب</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{totalPrice.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الشحن</span>
                  <span>سيتم تحديده عند الدفع</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>المجموع الإجمالي (تقريبي)</span>
                <span>{totalPrice.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
              </div>
              <Button asChild size="lg" className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/checkout">إتمام الشراء</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
