import { orders } from '@/lib/data';
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

const getStatusVariant = (status: (typeof orders)[0]['status']) => {
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

const statusTranslations = {
  Processing: 'قيد المعالجة',
  Shipped: 'تم الشحن',
  Delivered: 'تم التوصيل',
  Cancelled: 'ملغي',
};


export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline font-bold mb-8">طلباتي</h1>
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الطلبات</CardTitle>
          <CardDescription>عرض حالة وتفاصيل طلباتك السابقة.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">المجموع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('ar-AE')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {statusTranslations[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {order.total.toLocaleString('ar-AE', { style: 'currency', currency: 'AED' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
