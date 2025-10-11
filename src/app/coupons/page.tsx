import { Scissors } from 'lucide-react';

export default function CouponsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Scissors className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-8 text-4xl font-headline font-bold">كوبونات الخصم</h1>
        <p className="mt-4 text-xl text-muted-foreground">
            وفّر أكثر مع كوبوناتنا!
        </p>
        <p className="mt-2 text-muted-foreground">
            نحن نعمل على تجهيز قسم الكوبونات. تحقق مرة أخرى قريبًا!
        </p>
    </div>
  );
}
