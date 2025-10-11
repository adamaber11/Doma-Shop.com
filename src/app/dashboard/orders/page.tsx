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
import { collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

// We need a new type that includes the user's name
type OrderWithUser = Order & { customerName?: string };

export default function DashboardOrdersPage() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            const order: OrderWithUser = {
                ...data,
                id: doc.id,
                // The parent path will be like 'users/someUserId'
                customerName: data.shippingAddress?.fullName || 'غير معروف'
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
                <TableHead className="text-left">المجموع</TableHead>
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
                    <TableCell className="text-left">
                      {(order.totalAmount ?? 0).toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    لم يتم العثور على طلبات.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
