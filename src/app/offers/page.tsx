import { TicketPercent } from 'lucide-react';

export default function OffersPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <TicketPercent className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-8 text-4xl font-headline font-bold">العروض الخاصة</h1>
        <p className="mt-4 text-xl text-muted-foreground">
            نحن نعمل بجد لنقدم لكم أفضل العروض! هذه الصفحة قيد الإنشاء.
        </p>
        <p className="mt-2 text-muted-foreground">
            ترقبوا تخفيضاتنا ومنتجاتنا الحصرية قريبًا.
        </p>
    </div>
  );
}
