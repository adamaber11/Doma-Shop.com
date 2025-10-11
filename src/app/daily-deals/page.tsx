import { CalendarClock } from 'lucide-react';

export default function DailyDealsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <CalendarClock className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-8 text-4xl font-headline font-bold">العروض اليومية</h1>
        <p className="mt-4 text-xl text-muted-foreground">
            صفقة جديدة كل يوم! هذه الميزة قيد التطوير.
        </p>
        <p className="mt-2 text-muted-foreground">
            استعدوا لعروض يومية لا تقاوم على أفضل المنتجات.
        </p>
    </div>
  );
}
