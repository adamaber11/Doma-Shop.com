import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-headline font-bold">لوحة التحكم</h1>
      <Card>
        <CardHeader>
          <CardTitle>مرحباً بك في لوحة التحكم الخاصة بك</CardTitle>
        </CardHeader>
        <CardContent>
          <p>هنا يمكنك إدارة حسابك وعرض إحصائياتك.</p>
        </CardContent>
      </Card>
    </div>
  );
}
