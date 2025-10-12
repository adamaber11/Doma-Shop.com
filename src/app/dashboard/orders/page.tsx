
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs, query, orderBy, doc } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Eye } from 'lucide-react';

const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Shipped':
      return 'secondary';
    case 'Processing':
      return 'outline';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

const statusTranslations: Record<Order['status'], string> = {
  Processing: 'قيد المعالجة',
  Shipped: 'تم الشحن',
  Delivered: 'تم التوصيل',
  Cancelled: 'ملغي',
};

type OrderWithUser = Order & { customerName?: string; userId: string; };

function OrderDetailsDialog({ order }: { order: OrderWithUser | null }) {
  const firestore = useFirestore();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setIsOpen(true);
      const fetchOrderItems = async () => {
        if (!firestore || !order.userId) return;
        setIsLoadingItems(true);
        try {
          const itemsQuery = query(collection(firestore, `users/${order.userId}/orders/${order.id}/items`));
          const itemsSnapshot = await getDocs(itemsQuery);
          const orderItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderItem));
          setItems(orderItems);
        } catch (error) {
          console.error("Error fetching order items:", error);
        } finally {
          setIsLoadingItems(false);
        }
      };
      fetchOrderItems();
    } else {
      setIsOpen(false);
    }
  }, [order, firestore]);

  if (!order) return null;

  const { shippingAddress } = order;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>تفاصيل الطلب #{order.id.substring(0, 7)}</DialogTitle>
          <DialogDescription>
            بتاريخ {order.orderDate ? new Date(order.orderDate.toDate()).toLocaleString('ar-AE') : 'غير متوفر'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Customer Details */}
          <div>
            <h3 className="font-semibold mb-2">معلومات العميل</h3>
            <div className="text-sm space-y-1 text-muted-foreground p-4 border rounded-md bg-card">
              <p><strong>الاسم:</strong> {shippingAddress?.fullName}</p>
              <p><strong>الهاتف:</strong> {shippingAddress?.phone}</p>
              <p><strong>العنوان:</strong> {shippingAddress?.address}, {shippingAddress?.city}</p>
              <p><strong>المحافظة:</strong> {shippingAddress?.governorate}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-2">ملخص الطلب</h3>
            <div className="text-sm space-y-2 p-4 border rounded-md bg-card">
              <div className="flex justify-between"><span>الحالة:</span> <Badge variant={getStatusVariant(order.status)}>{statusTranslations[order.status]}</Badge></div>
              <Separator />
              <div className="flex justify-between"><span>المجموع الفرعي:</span> <span>{( (order.totalAmount ?? 0) - (order.shippingCost ?? 0)).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span></div>
              <div className="flex justify-between"><span>تكلفة الشحن:</span> <span>{(order.shippingCost ?? 0).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>الإجمالي:</span> <span>{(order.totalAmount ?? 0).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</span></div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-2">المنتجات</h3>
          <div className="border rounded-md">
            {isLoadingItems ? (
              <div className="p-4 text-center">جاري تحميل المنتجات...</div>
            ) : items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead className="text-left">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="text-xs text-muted-foreground">
                              {item.selectedColor && <span>{item.selectedColor}</span>}
                              {item.selectedColor && item.selectedSize && <span>, </span>}
                              {item.selectedSize && <span>{item.selectedSize}</span>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.itemPrice.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                      <TableCell className="text-left">{(item.itemPrice * item.quantity).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center">لم يتم العثور على منتجات لهذا الطلب.</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function DashboardOrdersPage() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(null);

  useEffect(() => {
    async function fetchAllOrders() {
      if (!firestore) return;

      setIsLoading(true);
      try {
        const ordersQuery = query(
          collectionGroup(firestore, 'orders'),
          orderBy('orderDate', 'desc')
        );
        const querySnapshot = await getDocs(ordersQuery);
        
        const allOrders: OrderWithUser[] = querySnapshot.docs.map(doc => {
            const data = doc.data() as Order;
            const parentPath = doc.ref.parent.parent?.path; // users/{userId}
            const userId = parentPath ? parentPath.split('/')[1] : '';

            const order: OrderWithUser = {
                ...data,
                id: doc.id,
                customerName: data.shippingAddress?.fullName || 'غير معروف',
                userId,
            };
            return order;
        });

        setOrders(allOrders);

      } catch (error) {
        console.error("Error fetching all orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllOrders();
  }, [firestore]);


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">طلبات العملاء</h1>
      <Card>
        <CardHeader>
          <CardTitle>جميع الطلبات</CardTitle>
          <CardDescription>عرض وإدارة جميع طلبات العملاء.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المجموع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0,7)}</TableCell>
                    <TableCell>
                      {order.orderDate
                        ? new Date(order.orderDate.toDate()).toLocaleDateString('ar-AE')
                        : 'غير متوفر'}
                    </TableCell>
                     <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {statusTranslations[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(order.totalAmount ?? 0).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    لم يتم العثور على طلبات.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <OrderDetailsDialog order={selectedOrder} />
    </div>
  );
}

    